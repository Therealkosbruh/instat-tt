import type { Static } from '@sinclair/typebox';
import { apiRequest } from '@/shared/api/client';
import { SandboxSchema } from '@checkout/contracts';
import type { Payment, Scenario, Simulation } from '@checkout/contracts';

export type Sandbox = Static<typeof SandboxSchema>;

const DEFAULT_RETRY_DELAY_MS = 1500;

export async function fetchSandbox(signal?: AbortSignal): Promise<Sandbox> {
  const { data } = await apiRequest<Sandbox>('/api/sandbox', { skipAuth: true, signal });
  return data;
}

export async function fetchPayments(orderId: string, signal?: AbortSignal): Promise<Payment[]> {
  const { data } = await apiRequest<Payment[]>(`/api/orders/${orderId}/payments`, { signal });
  return data;
}

export async function fetchPayment(paymentId: string, signal?: AbortSignal): Promise<Payment> {
  const { data } = await apiRequest<Payment>(`/api/payments/${paymentId}`, { signal });
  return data;
}

export async function createPayment(orderId: string, idempotencyKey: string): Promise<Payment> {
  const { data } = await apiRequest<Payment>(`/api/orders/${orderId}/payments`, {
    method: 'POST',
    body: {},
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}

interface SimulationResult {
  simulation: Simulation;
  retryAfterMs: number;
}

export async function simulatePayment(paymentId: string, scenario: Scenario): Promise<SimulationResult> {
  const { data, headers } = await apiRequest<Simulation>(`/api/payments/${paymentId}/simulations`, {
    method: 'POST',
    body: { scenario },
  });
  const retryAfterHeader = headers.get('Retry-After');
  const retryAfterSeconds = retryAfterHeader === null ? NaN : Number(retryAfterHeader);
  const retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : DEFAULT_RETRY_DELAY_MS;
  return { simulation: data, retryAfterMs };
}
