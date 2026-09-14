'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ensureSession } from '../api/ensure-session';

export const sessionQueryKey = ['session'] as const;

export function useSession(): UseQueryResult<string> {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: ensureSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
