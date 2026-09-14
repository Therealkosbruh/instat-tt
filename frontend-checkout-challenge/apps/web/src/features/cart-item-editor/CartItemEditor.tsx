'use client';

import type { ReactElement } from 'react';
import type { Cart } from '@checkout/contracts';
import { useRemoveCartItem, useSetCartItemQuantity } from '@/entities/cart/model/use-cart';
import { formatPrice } from '@/shared/lib/format-price';
import { getErrorMessage } from '@/shared/lib/get-error-message';
import { Icon } from '@/shared/ui/icon/Icon';
import styles from './CartItemEditor.module.scss';

interface CartItemEditorProps {
  item: Cart['items'][number];
}

export function CartItemEditor({ item }: CartItemEditorProps): ReactElement {
  const { mutate: setQuantity, isPending: isUpdating, error: updateError } = useSetCartItemQuantity();
  const { mutate: remove, isPending: isRemoving } = useRemoveCartItem();
  const isBusy = isUpdating || isRemoving;

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.unitPrice}>{formatPrice(item.unitPrice)} / шт.</span>
        {updateError && (
          <p className={styles.error} role="alert">
            {getErrorMessage(updateError)}
          </p>
        )}
      </div>
      <div className={styles.stepper}>
        <button
          type="button"
          aria-label="Уменьшить количество"
          disabled={isBusy || item.quantity <= 1}
          onClick={() => setQuantity({ productId: item.productId, quantity: item.quantity - 1 })}
        >
          <Icon name="minus" size={14} />
        </button>
        <span aria-live="polite">{item.quantity}</span>
        <button
          type="button"
          aria-label="Увеличить количество"
          disabled={isBusy || item.quantity >= 99}
          onClick={() => setQuantity({ productId: item.productId, quantity: item.quantity + 1 })}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Удалить «${item.title}» из корзины`}
        disabled={isBusy}
        onClick={() => remove(item.productId)}
      >
        <Icon name="trash" size={16} />
      </button>
    </li>
  );
}
