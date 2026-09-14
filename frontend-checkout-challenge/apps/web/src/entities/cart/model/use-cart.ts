'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { Cart } from '@checkout/contracts';
import { useSession } from '@/entities/session/model/use-session';
import { fetchCart, removeCartItem, setCartItemQuantity } from '../api/cart';

export const cartQueryKey = ['cart'] as const;

export function useCart(): UseQueryResult<Cart> {
  const { data: token } = useSession();
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: ({ signal }) => fetchCart(signal),
    enabled: !!token,
  });
}

export function useSetCartItemQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      setCartItemQuantity(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });
}
