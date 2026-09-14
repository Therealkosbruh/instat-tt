'use client';

import type { FormEvent, ReactElement } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { InfoBlock, InfoBlockSkeleton } from '@/shared/ui/info-block/InfoBlock';
import { SummaryCard } from '@/widgets/order-summary/SummaryCard';
import type { SummaryLine } from '@/widgets/order-summary/model/types';
import { estimateShippingCost } from '../lib/estimate-shipping';
import { useCheckoutForm } from '../model/use-checkout-form';
import { CustomerFields } from './CustomerFields';
import { DeliverySection } from './DeliverySection';
import { PaymentMethodSection } from './PaymentMethodSection';
import styles from './CheckoutForm.module.scss';

export function CheckoutForm(): ReactElement {
  const {
    cart,
    checkoutOptions,
    isContextLoading,
    customerForm,
    addressForm,
    deliveryMethod,
    setDeliveryMethod,
    pickupPointId,
    setPickupPointId,
    paymentMethod,
    setPaymentMethod,
    quote,
    isQuotePending,
    isQuoteMatchingSelection,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useCheckoutForm();

  if (isContextLoading) {
    return (
      <div className={styles.page}>
        <InfoBlockSkeleton count={3} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.page}>
        <InfoBlock status="emptyCart" actionHref="/" actionLabel="В каталог" />
      </div>
    );
  }

  if (!checkoutOptions) {
    return (
      <div className={styles.page}>
        <InfoBlock status="error" />
      </div>
    );
  }

  const currentQuote = isQuoteMatchingSelection ? quote : undefined;
  const selectedDeliveryOption = checkoutOptions.deliveryMethods.find(
    (method) => method.id === deliveryMethod,
  );
  const estimatedShipping = estimateShippingCost(selectedDeliveryOption, cart.subtotal);

  const summaryItems = currentQuote?.items ?? cart.items;
  const summaryLines: SummaryLine[] = currentQuote
    ? [
        { label: 'Товары', value: currentQuote.subtotal },
        { label: 'Доставка', value: currentQuote.shipping },
      ]
    : selectedDeliveryOption
      ? [
          { label: 'Товары', value: cart.subtotal },
          { label: 'Доставка', value: estimatedShipping },
        ]
      : [{ label: 'Товары', value: cart.subtotal }];
  const summaryTotal = currentQuote
    ? currentQuote.total
    : cart.subtotal + (selectedDeliveryOption ? estimatedShipping : 0);
  const canSubmit = Boolean(deliveryMethod && paymentMethod && isQuoteMatchingSelection) && !isSubmitting;

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleSubmit();
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Оформление заказа</h1>
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Контакты</h2>
            <CustomerFields form={customerForm} />
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Доставка</h2>
            <DeliverySection
              deliveryMethods={checkoutOptions.deliveryMethods}
              method={deliveryMethod}
              onMethodChange={setDeliveryMethod}
              pickupPointId={pickupPointId}
              onPickupPointChange={setPickupPointId}
              addressForm={addressForm}
            />
            {isQuotePending && <p className={styles.hint}>Считаем стоимость доставки…</p>}
          </section>

          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Оплата</h2>
            <PaymentMethodSection
              paymentMethods={checkoutOptions.paymentMethods}
              method={paymentMethod}
              onChange={setPaymentMethod}
            />
          </section>

          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting} disabled={!canSubmit}>
            Оформить заказ
          </Button>
        </form>

        <SummaryCard
          items={summaryItems.map((item) => ({
            id: item.productId,
            title: item.title,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          }))}
          lines={summaryLines}
          total={{ label: 'Итого', value: summaryTotal }}
        />
      </div>
    </div>
  );
}
