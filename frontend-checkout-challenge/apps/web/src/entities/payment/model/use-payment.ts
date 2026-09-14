'use client';

import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Payment, Scenario, Simulation } from '@checkout/contracts';
import {
  createPayment,
  fetchPayment,
  fetchPayments,
  fetchSandbox,
  simulatePayment,
  type Sandbox,
} from '../api/payment';

const TERMINAL_STATUSES = new Set<Payment['status']>(['succeeded', 'failed', 'cancelled']);

export function isPaymentTerminal(status: Payment['status']): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function useSandbox(enabled: boolean): UseQueryResult<Sandbox> {
  return useQuery({
    queryKey: ['sandbox'],
    queryFn: ({ signal }) => fetchSandbox(signal),
    enabled,
    staleTime: Infinity,
  });
}

export function usePayments(orderId: string | undefined): UseQueryResult<Payment[]> {
  return useQuery({
    queryKey: ['payments', orderId],
    queryFn: ({ signal }) => fetchPayments(orderId as string, signal),
    enabled: !!orderId,
  });
}

export function usePaymentPolling(
  paymentId: string | undefined,
  intervalMs: number = 1500,
): UseQueryResult<Payment> {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: ({ signal }) => fetchPayment(paymentId as string, signal),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isPaymentTerminal(status) ? false : intervalMs;
    },
  });
}

export function useCreatePayment() {
  return useMutation<Payment, unknown, { orderId: string; idempotencyKey: string }>({
    mutationFn: ({ orderId, idempotencyKey }) => createPayment(orderId, idempotencyKey),
  });
}

interface SimulateParams {
  paymentId: string;
  scenario: Scenario;
}

export function useSimulatePayment() {
  return useMutation<{ simulation: Simulation; retryAfterMs: number }, unknown, SimulateParams>({
    mutationFn: ({ paymentId, scenario }) => simulatePayment(paymentId, scenario),
  });
}
