import { apiRequest } from '@/shared/api/client';
import type { CreateOrder, Order } from '@checkout/contracts';

export async function createOrder(body: CreateOrder, idempotencyKey: string): Promise<Order> {
  const { data } = await apiRequest<Order>('/api/orders', {
    method: 'POST',
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}

export async function fetchOrder(orderId: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await apiRequest<Order>(`/api/orders/${orderId}`, { signal });
  return data;
}
