'use client';

import type { ReactElement } from 'react';
import { useCheckoutOptions } from '@/entities/checkout-options/model/use-checkout-options';
import { useOrder } from '@/entities/order/model/use-order';
import { PaymentForm } from '@/features/payment-form/ui/PaymentForm';
import { Icon } from '@/shared/ui/icon/Icon';
import { InfoBlock, InfoBlockSkeleton } from '@/shared/ui/info-block/InfoBlock';
import { SummaryCard } from '@/widgets/order-summary/SummaryCard';
import { describeDelivery } from './lib/describe-delivery';
import styles from './OrderView.module.scss';

interface OrderViewProps {
  orderId: string;
}

export function OrderView({ orderId }: OrderViewProps): ReactElement {
  const { data: order, isPending, isError, refetch } = useOrder(orderId);
  const { data: checkoutOptions } = useCheckoutOptions();

  if (isPending) {
    return (
      <div className={styles.page}>
        <InfoBlockSkeleton count={2} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className={styles.page}>
        <InfoBlock status="error" actionLabel="Повторить" onAction={() => void refetch()} />
      </div>
    );
  }

  const isCash = order.paymentMethod === 'cash_on_delivery';
  const isSuccess = isCash ? order.status === 'confirmed' : order.status === 'paid';

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <p className={styles.orderNumber}>Заказ {order.number}</p>
          {isSuccess ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <Icon name="check" size={24} />
              </div>
              <h1 className={styles.heading}>
                {isCash ? 'Заказ оформлен' : 'Оплата прошла успешно'}
              </h1>
              <p className={styles.text}>
                {isCash
                  ? 'Оплата при получении.'
                  : 'Мы отправим уведомление, когда заказ будет готов к получению.'}
              </p>
            </div>
          ) : (
            <>
              <h1 className={styles.heading}>Оплата заказа</h1>
              <PaymentForm orderId={order.id} />
            </>
          )}
          <p className={styles.delivery}>{describeDelivery(order.delivery, checkoutOptions?.deliveryMethods)}</p>
        </div>

        <SummaryCard
          items={order.items.map((item) => ({
            id: item.productId,
            title: item.title,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          }))}
          lines={[
            { label: 'Товары', value: order.subtotal },
            { label: 'Доставка', value: order.shipping },
          ]}
          total={{ label: 'Итого', value: order.total }}
        />
      </div>
    </div>
  );
}
