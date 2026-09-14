'use client';

import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CreateOrder, Order } from '@checkout/contracts';
import { createOrder, fetchOrder } from '../api/order';

export function useOrder(orderId: string | undefined): UseQueryResult<Order> {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: ({ signal }) => fetchOrder(orderId as string, signal),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  return useMutation<Order, unknown, { body: CreateOrder; idempotencyKey: string }>({
    mutationFn: ({ body, idempotencyKey }) => createOrder(body, idempotencyKey),
  });
}
