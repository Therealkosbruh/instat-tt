import type { GenerationData, GenerationRequest } from '@canvas/contracts';
import { request } from './client';

export interface CreateGenerationResult {
  generation: GenerationData;
  status: number;
  retryAfterMs: number | null;
}

export async function createGeneration(
  spaceId: string,
  body: GenerationRequest,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<CreateGenerationResult> {
  const { data, status, headers } = await request<GenerationData>({
    method: 'POST',
    path: `/api/spaces/${spaceId}/generations`,
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
    signal,
  });
  const retryAfterHeader = headers.get('Retry-After');
  const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null;
  return { generation: data, status, retryAfterMs };
}

export async function fetchGeneration(
  spaceId: string,
  generationId: string,
  signal?: AbortSignal,
): Promise<GenerationData> {
  const { data } = await request<GenerationData>({
    path: `/api/spaces/${spaceId}/generations/${generationId}`,
    signal,
  });
  return data;
}

export async function listGenerations(
  spaceId: string,
  signal?: AbortSignal,
): Promise<GenerationData[]> {
  const { data } = await request<GenerationData[]>({
    path: `/api/spaces/${spaceId}/generations`,
    signal,
  });
  return data;
}
