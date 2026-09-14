import { apiRequest } from '@/shared/api/client';
import type { Cart } from '@checkout/contracts';

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await apiRequest<Cart>('/api/cart', { signal });
  return data;
}

export async function setCartItemQuantity(productId: string, quantity: number): Promise<void> {
  await apiRequest(`/api/cart/items/${productId}`, {
    method: 'PUT',
    body: { quantity },
  });
}

export async function removeCartItem(productId: string): Promise<void> {
  await apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' });
}
