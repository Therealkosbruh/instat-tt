import type { GenerationData, GenerationRequest } from '@canvas/contracts';
import { create } from 'zustand';
import { ApiError, isAbortError, toApiError } from '../api/client';
import { createGeneration, fetchGeneration } from '../api/generations';
import {
  buildResumedAttempts,
  isTransportRetry,
  snapshotFromGeneration,
} from '../lib/generation-flow';
import type { GenerationAttempt } from '../lib/generation-types';
import { createIdempotencyKey } from '../lib/idempotency';
import { type PollController, startPolling } from '../lib/poll';
import { getEffectiveConfig } from './configStore';
import { useGraphStore } from './graphStore';

interface GenerateParams {
  spaceId: string;
  nodeId: string;
  resultNodeId: string;
  scenario: GenerationRequest['scenario'];
}

interface GenerationState {
  attempts: Record<string, GenerationAttempt>;
  generate: (params: GenerateParams) => Promise<void>;
  retry: (params: { spaceId: string; nodeId: string }) => void;
  removeForNode: (nodeId: string) => void;
  resumeFromHistory: (
    spaceId: string,
    generations: GenerationData[],
    currentNodeIds: ReadonlySet<string>,
  ) => void;
  stopAll: () => void;
}

const pollControllers = new Map<string, PollController>();

function stopPollingFor(nodeId: string): void {
  pollControllers.get(nodeId)?.stop();
  pollControllers.delete(nodeId);
}

export const useGenerationStore = create<GenerationState>((set, get) => {
  const patchAttempt = (nodeId: string, patch: Partial<GenerationAttempt>): void => {
    set((state) => {
      const current = state.attempts[nodeId];
      if (!current) return state;
      return { attempts: { ...state.attempts, [nodeId]: { ...current, ...patch } } };
    });
  };

  const setAttempt = (nodeId: string, attempt: GenerationAttempt): void => {
    set((state) => ({ attempts: { ...state.attempts, [nodeId]: attempt } }));
  };

  const schedulePolling = (
    spaceId: string,
    nodeId: string,
    generationId: string,
    initialDelayMs: number,
  ): void => {
    stopPollingFor(nodeId);
    const pollIntervalMs = getEffectiveConfig().pollIntervalMs;
    const controller = startPolling<GenerationData>({
      execute: (signal) => fetchGeneration(spaceId, generationId, signal),
      isDone: (result) => result.status !== 'processing',
      delayMs: (result) => (result === null ? initialDelayMs : pollIntervalMs),
      onResult: (result) => {
        const current = get().attempts[nodeId];
        if (!current || current.generationId !== generationId) {
          stopPollingFor(nodeId);
          return;
        }
        patchAttempt(nodeId, snapshotFromGeneration(result));
      },
      onError: (error) => {
        const current = get().attempts[nodeId];
        if (!current || current.generationId !== generationId) return;
        patchAttempt(nodeId, { error: toApiError(error) });
      },
    });
    pollControllers.set(nodeId, controller);
  };

  const applyCreated = (
    spaceId: string,
    nodeId: string,
    generation: GenerationData,
    retryAfterMs: number | null,
  ): void => {
    patchAttempt(nodeId, snapshotFromGeneration(generation));
    if (generation.status === 'processing') {
      schedulePolling(
        spaceId,
        nodeId,
        generation.id,
        retryAfterMs ?? getEffectiveConfig().pollIntervalMs,
      );
    }
  };

  return {
    attempts: {},

    generate: async ({ spaceId, nodeId, resultNodeId, scenario }) => {
      stopPollingFor(nodeId);
      const previous = get().attempts[nodeId];

      let idempotencyKey: string;
      let requestBody: GenerationRequest | null;
      if (isTransportRetry(previous, resultNodeId, scenario)) {
        idempotencyKey = previous.idempotencyKey;
        requestBody = previous.requestBody;
      } else {
        idempotencyKey = createIdempotencyKey();
        requestBody = null;
      }

      setAttempt(nodeId, {
        nodeId,
        resultNodeId,
        idempotencyKey,
        requestBody,
        generationId: null,
        status: 'idle',
        imageUrl: null,
        failureCode: null,
        error: null,
      });

      const { ok, etag } = await useGraphStore.getState().flushAndWaitForSave();
      if (!ok || !etag) {
        patchAttempt(nodeId, {
          error: new ApiError({
            kind: 'http',
            message: 'Сначала нужно сохранить изменения графа.',
          }),
        });
        return;
      }

      if (!requestBody) requestBody = { nodeId, graphETag: etag, scenario };

      try {
        const { generation, retryAfterMs } = await createGeneration(
          spaceId,
          requestBody,
          idempotencyKey,
        );
        applyCreated(spaceId, nodeId, generation, retryAfterMs);
      } catch (error) {
        if (isAbortError(error)) return;
        patchAttempt(nodeId, { error: toApiError(error) });
      }
    },

    retry: ({ spaceId, nodeId }) => {
      const attempt = get().attempts[nodeId];
      if (!attempt) return;
      if (attempt.error && attempt.generationId) {
        patchAttempt(nodeId, { status: 'processing', error: null });
        schedulePolling(spaceId, nodeId, attempt.generationId, getEffectiveConfig().pollIntervalMs);
        return;
      }
      const scenario = attempt.requestBody?.scenario ?? 'success';
      void get().generate({ spaceId, nodeId, resultNodeId: attempt.resultNodeId, scenario });
    },

    removeForNode: (deletedNodeId) => {
      stopPollingFor(deletedNodeId);
      set((state) => {
        let changed = false;
        const attempts: Record<string, GenerationAttempt> = {};
        for (const [key, attempt] of Object.entries(state.attempts)) {
          if (key === deletedNodeId || attempt.resultNodeId === deletedNodeId) {
            stopPollingFor(key);
            changed = true;
            continue;
          }
          attempts[key] = attempt;
        }
        return changed ? { attempts } : state;
      });
    },

    resumeFromHistory: (spaceId, generations, currentNodeIds) => {
      for (const controller of pollControllers.values()) controller.stop();
      pollControllers.clear();
      const attempts = buildResumedAttempts(generations, currentNodeIds);
      set({ attempts });
      for (const [nodeId, attempt] of Object.entries(attempts)) {
        if (attempt.status === 'processing' && attempt.generationId) {
          schedulePolling(
            spaceId,
            nodeId,
            attempt.generationId,
            getEffectiveConfig().pollIntervalMs,
          );
        }
      }
    },

    stopAll: () => {
      for (const controller of pollControllers.values()) controller.stop();
      pollControllers.clear();
      set({ attempts: {} });
    },
  };
});
