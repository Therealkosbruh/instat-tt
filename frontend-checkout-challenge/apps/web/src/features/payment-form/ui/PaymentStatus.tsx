import type { ReactElement } from 'react';
import type { Payment } from '@checkout/contracts';
import { Button } from '@/shared/ui/button/Button';
import { Icon } from '@/shared/ui/icon/Icon';
import styles from './PaymentStatus.module.scss';

interface PaymentStatusProps {
  payment: Payment;
  onRetry: () => void;
}

const MESSAGE_BY_STATUS: Partial<Record<Payment['status'], { title: string; text: string }>> = {
  pending: { title: 'Обрабатываем оплату', text: 'Обычно это занимает несколько секунд.' },
  processing: { title: 'Обрабатываем оплату', text: 'Обычно это занимает несколько секунд.' },
  failed: {
    title: 'Оплата отклонена',
    text: 'Банк отклонил операцию. Попробуйте оплатить ещё раз другой тестовой картой.',
  },
  cancelled: { title: 'Оплата отменена', text: 'Вы можете попробовать оплатить ещё раз.' },
};

export function PaymentStatus({ payment, onRetry }: PaymentStatusProps): ReactElement {
  const isRetryable = payment.status === 'failed' || payment.status === 'cancelled';
  const isWaiting = payment.status === 'pending' || payment.status === 'processing';
  const content = MESSAGE_BY_STATUS[payment.status];

  return (
    <div className={styles.wrapper} role={isRetryable ? 'alert' : 'status'}>
      <div className={styles.iconCircle}>
        <Icon name={isWaiting ? 'spinner' : 'alert'} size={22} />
      </div>
      {content && (
        <>
          <h3 className={styles.title}>{content.title}</h3>
          <p className={styles.text}>{content.text}</p>
        </>
      )}
      {isRetryable && <Button onClick={onRetry}>Оплатить ещё раз</Button>}
    </div>
  );
}
