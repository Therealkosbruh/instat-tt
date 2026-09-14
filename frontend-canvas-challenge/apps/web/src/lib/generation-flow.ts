import type { GenerationData, GenerationRequest } from '@canvas/contracts';
import type { GenerationAttempt, GenerationStatus, StatusTone } from './generation-types';

export interface GenerationStatusView {
  label: string;
  tone: StatusTone;
}

const STATUS_VIEWS: Record<GenerationStatus, GenerationStatusView> = {
  idle: { label: '', tone: 'idle' },
  processing: { label: 'Генерация…', tone: 'progress' },
  succeeded: { label: 'Готово', tone: 'success' },
  failed: { label: 'Отказ генерации', tone: 'error' },
};

export function describeGenerationState(
  attempt: GenerationAttempt | undefined,
): GenerationStatusView {
  if (!attempt) return STATUS_VIEWS.idle;
  if (attempt.error) return { label: 'Ошибка соединения', tone: 'error' };
  return STATUS_VIEWS[attempt.status];
}

export function snapshotFromGeneration(
  generation: GenerationData,
): Pick<
  GenerationAttempt,
  'generationId' | 'resultNodeId' | 'status' | 'imageUrl' | 'failureCode' | 'error'
> {
  return {
    generationId: generation.id,
    resultNodeId: generation.resultNodeId,
    status: generation.status,
    imageUrl: generation.imageUrl,
    failureCode: generation.failureCode,
    error: null,
  };
}

export function isTransportRetry(
  previous: GenerationAttempt | undefined,
  resultNodeId: string,
  scenario: GenerationRequest['scenario'],
): previous is GenerationAttempt & { requestBody: GenerationRequest; idempotencyKey: string } {
  return (
    previous !== undefined &&
    previous.error !== null &&
    previous.generationId === null &&
    previous.resultNodeId === resultNodeId &&
    previous.requestBody !== null &&
    previous.requestBody.scenario === scenario &&
    previous.idempotencyKey !== null
  );
}

export function buildResumedAttempts(
  generations: readonly GenerationData[],
  currentNodeIds: ReadonlySet<string>,
): Record<string, GenerationAttempt> {
  const seen = new Set<string>();
  const attempts: Record<string, GenerationAttempt> = {};
  for (const generation of generations) {
    if (seen.has(generation.nodeId)) continue;
    seen.add(generation.nodeId);
    if (!currentNodeIds.has(generation.nodeId) || !currentNodeIds.has(generation.resultNodeId))
      continue;
    attempts[generation.nodeId] = {
      nodeId: generation.nodeId,
      idempotencyKey: null,
      requestBody: {
        nodeId: generation.nodeId,
        graphETag: generation.graphETag,
        scenario: generation.scenario,
      },
      ...snapshotFromGeneration(generation),
    };
  }
  return attempts;
}
