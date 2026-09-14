'use client';

import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Quote } from '@checkout/contracts';
import { useSession } from '@/entities/session/model/use-session';
import {
  createQuote,
  fetchCheckoutOptions,
  type CheckoutOptions,
  type QuoteRequest,
} from '../api/checkout-options';

export function useCheckoutOptions(): UseQueryResult<CheckoutOptions> {
  const { data: token } = useSession();
  return useQuery({
    queryKey: ['checkout-options'],
    queryFn: ({ signal }) => fetchCheckoutOptions(signal),
    enabled: !!token,
  });
}

export function useCreateQuote() {
  return useMutation<Quote, unknown, QuoteRequest>({
    mutationFn: createQuote,
  });
}
