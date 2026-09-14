import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Delivery } from '@checkout/contracts';
import type { CheckoutOptions } from '@/entities/checkout-options/api/checkout-options';
import { formatPrice } from '@/shared/lib/format-price';
import { Field } from '@/shared/ui/field/Field';
import { TextInput } from '@/shared/ui/field/TextInput';
import { SelectableCard } from '@/shared/ui/selectable-card/SelectableCard';
import type { AddressValues } from '../model/address-schema';
import styles from './DeliverySection.module.scss';

type DeliveryMethodId = Delivery['method'];

interface DeliverySectionProps {
  deliveryMethods: CheckoutOptions['deliveryMethods'];
  method: DeliveryMethodId | undefined;
  onMethodChange: (method: DeliveryMethodId) => void;
  pickupPointId: string | undefined;
  onPickupPointChange: (id: string) => void;
  addressForm: UseFormReturn<AddressValues>;
}

export function DeliverySection({
  deliveryMethods,
  method,
  onMethodChange,
  pickupPointId,
  onPickupPointChange,
  addressForm,
}: DeliverySectionProps): ReactElement {
  const pickupMethod = deliveryMethods.find((item) => item.id === 'pickup');

  return (
    <div className={styles.section}>
      <div className={styles.methods}>
        {deliveryMethods.map((item) => (
          <SelectableCard
            key={item.id}
            selected={method === item.id}
            onSelect={() => onMethodChange(item.id)}
            title={item.title}
            meta={item.price === 0 ? 'Бесплатно' : formatPrice(item.price)}
          />
        ))}
      </div>

      {method === 'pickup' && pickupMethod && (
        <div className={styles.points} role="group" aria-label="Пункт выдачи">
          {pickupMethod.pickupPoints.map((point) => (
            <SelectableCard
              key={point.id}
              selected={pickupPointId === point.id}
              onSelect={() => onPickupPointChange(point.id)}
              title={point.title}
              description={point.address}
            />
          ))}
        </div>
      )}

      {method === 'courier' && (
        <div className={styles.address} role="group" aria-label="Адрес доставки">
          <Field label="Город" error={addressForm.formState.errors.city?.message}>
            <TextInput {...addressForm.register('city')} autoComplete="address-level2" />
          </Field>
          <Field label="Улица" error={addressForm.formState.errors.street?.message}>
            <TextInput {...addressForm.register('street')} autoComplete="address-line1" />
          </Field>
          <Field label="Дом" error={addressForm.formState.errors.house?.message}>
            <TextInput {...addressForm.register('house')} inputMode="numeric" placeholder="10" />
          </Field>
          <Field
            label="Квартира (необязательно)"
            error={addressForm.formState.errors.apartment?.message}
          >
            <TextInput {...addressForm.register('apartment')} inputMode="numeric" placeholder="1" />
          </Field>
        </div>
      )}
    </div>
  );
}
