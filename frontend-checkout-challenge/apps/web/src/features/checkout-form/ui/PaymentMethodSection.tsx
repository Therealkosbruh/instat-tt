import type { ReactElement } from 'react';
import type { Static } from '@sinclair/typebox';
import type { PaymentMethodSchema } from '@checkout/contracts';
import type { CheckoutOptions } from '@/entities/checkout-options/api/checkout-options';
import { SelectableCard } from '@/shared/ui/selectable-card/SelectableCard';
import styles from './PaymentMethodSection.module.scss';

type PaymentMethod = Static<typeof PaymentMethodSchema>;

interface PaymentMethodSectionProps {
  paymentMethods: CheckoutOptions['paymentMethods'];
  method: PaymentMethod | undefined;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSection({
  paymentMethods,
  method,
  onChange,
}: PaymentMethodSectionProps): ReactElement {
  return (
    <div className={styles.section} role="group" aria-label="Способ оплаты">
      {paymentMethods.map((item) => (
        <SelectableCard
          key={item.id}
          selected={method === item.id}
          onSelect={() => onChange(item.id)}
          title={item.title}
        />
      ))}
    </div>
  );
}
