'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Delivery, PaymentMethodSchema } from '@checkout/contracts';
import type { Static } from '@sinclair/typebox';
import { cartQueryKey, useCart } from '@/entities/cart/model/use-cart';
import { useCheckoutOptions, useCreateQuote } from '@/entities/checkout-options/model/use-checkout-options';
import { useCreateOrder } from '@/entities/order/model/use-order';
import { useIdempotencyKey } from '@/shared/api/idempotency';
import { isApiError, isStaleDataError } from '@/shared/api/errors';
import { isAddressReady } from '../lib/address';
import { extractCustomerErrors } from '../lib/extract-customer-errors';
import { addressSchema, INITIAL_ADDRESS, type AddressValues } from './address-schema';
import { customerSchema, INITIAL_CUSTOMER, type CustomerValues } from './customer-schema';

type PaymentMethod = Static<typeof PaymentMethodSchema>;
type DeliveryMethodId = Delivery['method'];

const QUOTE_DEBOUNCE_MS = 400;

export function useCheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cart, isPending: isCartPending } = useCart();
  const { data: checkoutOptions, isPending: isOptionsPending } = useCheckoutOptions();

  const customerForm = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: INITIAL_CUSTOMER,
    mode: 'onChange',
  });
  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: INITIAL_ADDRESS,
    mode: 'onChange',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId | undefined>(undefined);
  const [pickupPointId, setPickupPointId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [quoteSignature, setQuoteSignature] = useState<string | undefined>(undefined);

  const createQuote = useCreateQuote();
  const createOrder = useCreateOrder();
  const idempotency = useIdempotencyKey();

  const address = addressForm.watch();
  const deliverySignature =
    deliveryMethod === 'pickup' && pickupPointId
      ? `pickup:${pickupPointId}`
      : deliveryMethod === 'courier' && isAddressReady(address)
        ? `courier:${address.city}|${address.street}|${address.house}|${address.apartment ?? ''}`
        : undefined;

  useEffect(() => {
    if (!cart || !deliverySignature || !deliveryMethod) return;

    const delivery: Delivery =
      deliveryMethod === 'pickup'
        ? { method: 'pickup', pickupPointId: pickupPointId! }
        : {
            method: 'courier',
            address: {
              city: address.city.trim(),
              street: address.street.trim(),
              house: address.house.trim(),
              apartment: address.apartment?.trim() || undefined,
            },
          };

    const signatureAtRequest = deliverySignature;
    const timer = setTimeout(() => {
      createQuote.mutate(
        { cartVersion: cart.version, delivery },
        { onSuccess: () => setQuoteSignature(signatureAtRequest) },
      );
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.version, deliverySignature, deliveryMethod]);

  const quote = createQuote.data;
  const isQuoteMatchingSelection =
    quote !== undefined &&
    quote.cartVersion === cart?.version &&
    quoteSignature === deliverySignature;

  async function handleSubmit(): Promise<void> {
    setSubmitError(undefined);
    const isCustomerValid = await customerForm.trigger();
    if (!isCustomerValid) return;
    if (!deliveryMethod) {
      setSubmitError('Выберите способ доставки.');
      return;
    }
    if (!paymentMethod) {
      setSubmitError('Выберите способ оплаты.');
      return;
    }
    if (!isQuoteMatchingSelection || !quote) {
      setSubmitError('Дождитесь расчёта стоимости доставки.');
      return;
    }

    const customer = customerForm.getValues();

    try {
      const order = await createOrder.mutateAsync({
        body: {
          quoteId: quote.id,
          paymentMethod,
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone,
          },
        },
        idempotencyKey: idempotency.getKey(),
      });
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      router.push(`/orders/${order.id}`);
    } catch (error) {
      if (isStaleDataError(error)) {
        idempotency.renew();
        await queryClient.invalidateQueries({ queryKey: cartQueryKey });
        setQuoteSignature(undefined);
        setSubmitError(
          'Корзина или расчёт устарели. Мы обновили данные — проверьте заказ и попробуйте снова.',
        );
        return;
      }
      if (isApiError(error) && error.code === 'VALIDATION_ERROR' && error.fields) {
        const fieldErrors = extractCustomerErrors(error.fields);
        for (const [field, message] of Object.entries(fieldErrors)) {
          customerForm.setError(field as keyof CustomerValues, { type: 'server', message });
        }
        setSubmitError(error.message);
        return;
      }
      setSubmitError(isApiError(error) ? error.message : 'Не удалось оформить заказ. Попробуйте ещё раз.');
    }
  }

  return {
    cart,
    checkoutOptions,
    isContextLoading: isCartPending || isOptionsPending,
    customerForm,
    addressForm,
    deliveryMethod,
    setDeliveryMethod,
    pickupPointId,
    setPickupPointId,
    paymentMethod,
    setPaymentMethod,
    quote,
    isQuotePending: createQuote.isPending,
    isQuoteMatchingSelection,
    handleSubmit,
    isSubmitting: createOrder.isPending,
    submitError,
  };
}
