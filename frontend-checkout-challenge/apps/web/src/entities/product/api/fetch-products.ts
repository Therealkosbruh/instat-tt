import { apiRequest } from '@/shared/api/client';
import type { Product } from '@checkout/contracts';

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const { data } = await apiRequest<Product[]>('/api/products', { skipAuth: true, signal });
  return data;
}
