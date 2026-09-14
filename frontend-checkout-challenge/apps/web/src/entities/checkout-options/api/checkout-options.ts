import type { Static } from '@sinclair/typebox';
import { apiRequest } from '@/shared/api/client';
import { CheckoutOptionsSchema, QuoteBody } from '@checkout/contracts';
import type { Quote } from '@checkout/contracts';

export type CheckoutOptions = Static<typeof CheckoutOptionsSchema>;
export type QuoteRequest = Static<typeof QuoteBody>;

export async function fetchCheckoutOptions(signal?: AbortSignal): Promise<CheckoutOptions> {
  const { data } = await apiRequest<CheckoutOptions>('/api/checkout/options', { signal });
  return data;
}

export async function createQuote(body: QuoteRequest): Promise<Quote> {
  const { data } = await apiRequest<Quote>('/api/quotes', { method: 'POST', body });
  return data;
}
