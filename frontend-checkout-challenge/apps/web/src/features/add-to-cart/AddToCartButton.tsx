'use client';

import type { ReactElement } from 'react';
import { useCart, useSetCartItemQuantity } from '@/entities/cart/model/use-cart';
import { Button } from '@/shared/ui/button/Button';

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps): ReactElement {
  const { data: cart } = useCart();
  const { mutate, isPending } = useSetCartItemQuantity();
  const currentQuantity = cart?.items.find((item) => item.productId === productId)?.quantity ?? 0;
  const isAtLimit = currentQuantity >= stock;

  if (stock <= 0) {
    return (
      <Button variant="ghost" disabled>
        Нет в наличии
      </Button>
    );
  }

  return (
    <Button
      variant={currentQuantity > 0 ? 'ghost' : 'primary'}
      loading={isPending}
      disabled={isAtLimit}
      onClick={() => mutate({ productId, quantity: Math.min(currentQuantity + 1, stock) })}
    >
      {currentQuantity > 0 ? `В корзине: ${currentQuantity}` : 'В корзину'}
    </Button>
  );
}
