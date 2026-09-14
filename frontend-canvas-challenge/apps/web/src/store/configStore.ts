import { create } from 'zustand';
import { type ApiConfig, fetchConfig } from '../api/config';
import { isApiError } from '../api/client';
import type { AsyncStatus } from '../lib/async-status';

const DEFAULT_CONFIG: ApiConfig = {
  debounceMs: 500,
  pollIntervalMs: 500,
  generationDelayMs: 1500,
  maxNodes: 20,
  maxEdges: 20,
  nodeTypes: ['prompt', 'generator', 'result'],
  links: {},
};

interface ConfigState {
  config: ApiConfig;
  status: AsyncStatus;
  error: string | null;
  load: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: DEFAULT_CONFIG,
  status: 'idle',
  error: null,
  load: async () => {
    if (get().status === 'loading' || get().status === 'loaded') return;
    set({ status: 'loading', error: null });
    try {
      const config = await fetchConfig();
      set({ config, status: 'loaded' });
    } catch (error) {
      set({
        status: 'error',
        error: isApiError(error) ? error.message : 'Не удалось загрузить конфигурацию.',
      });
    }
  },
}));

export function getEffectiveConfig(): ApiConfig {
  return useConfigStore.getState().config;
}
