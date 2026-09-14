import { request } from './client';

export interface ApiConfigLink {
  href: string;
  method: 'GET' | 'POST' | 'PUT';
}

export interface ApiConfig {
  debounceMs: number;
  pollIntervalMs: number;
  generationDelayMs: number;
  maxNodes: number;
  maxEdges: number;
  nodeTypes: string[];
  links: Record<string, ApiConfigLink>;
}

export async function fetchConfig(signal?: AbortSignal): Promise<ApiConfig> {
  const { data } = await request<ApiConfig>({ path: '/api/config', signal });
  return data;
}
