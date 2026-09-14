'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { useCart } from '@/entities/cart/model/use-cart';
import { formatPrice } from '@/shared/lib/format-price';
import { Icon } from '@/shared/ui/icon/Icon';
import styles from './Header.module.scss';

export function Header(): ReactElement {
  const { data: cart } = useCart();
  const count = cart?.quantity ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Магазин
      </Link>
      <Link href="/cart" className={styles.cartLink} aria-label="Корзина">
        <Icon name="cart" />
        <span>
          {count} · {formatPrice(subtotal)}
        </span>
      </Link>
    </header>
  );
}
