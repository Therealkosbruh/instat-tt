'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { useCart } from '@/entities/cart/model/use-cart';
import { CartItemEditor } from '@/features/cart-item-editor/CartItemEditor';
import { pluralize } from '@/shared/lib/pluralize';
import { Button } from '@/shared/ui/button/Button';
import { InfoBlock, InfoBlockSkeleton } from '@/shared/ui/info-block/InfoBlock';
import { SummaryCard } from '@/widgets/order-summary/SummaryCard';
import styles from './CartView.module.scss';

export function CartView(): ReactElement {
  const { data: cart, isPending, isError, refetch } = useCart();

  if (isPending) {
    return (
      <div className={styles.page}>
        <InfoBlockSkeleton count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <InfoBlock status="error" actionLabel="Повторить" onAction={() => void refetch()} />
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

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.heading}>Корзина</h1>
          <p className={styles.count}>
            {cart.quantity} {pluralize(cart.quantity, ['товар', 'товара', 'товаров'])}
          </p>
        </div>
        <Link href="/" className={styles.continue}>
          Продолжить покупки
        </Link>
      </div>
      <div className={styles.layout}>
        <ul className={styles.list}>
          {cart.items.map((item) => (
            <CartItemEditor key={item.productId} item={item} />
          ))}
        </ul>
        <SummaryCard
          lines={[]}
          total={{ label: 'Сумма', value: cart.subtotal }}
          action={
            <Link href="/checkout" className={styles.checkoutLink}>
              <Button fullWidth>Оформить заказ</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
