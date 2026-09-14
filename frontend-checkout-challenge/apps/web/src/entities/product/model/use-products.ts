'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Product } from '@checkout/contracts';
import { fetchProducts } from '../api/fetch-products';

export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: ['products'],
    queryFn: ({ signal }) => fetchProducts(signal),
  });
}
