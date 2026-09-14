import type { GenerationData, GenerationRequest } from '@canvas/contracts';
import type { ApiError } from '../api/client';

export type GenerationStatus = 'idle' | GenerationData['status'];
export type StatusTone = 'idle' | 'progress' | 'success' | 'error';

export interface GenerationAttempt {
  nodeId: string;
  resultNodeId: string;
  idempotencyKey: string | null;
  requestBody: GenerationRequest | null;
  generationId: string | null;
  status: GenerationStatus;
  imageUrl: string | null;
  failureCode: string | null;
  error: ApiError | null;
}
