import type { GraphData } from '@canvas/contracts';
import { ApiError, request } from './client';

export interface GraphSnapshot {
  graph: GraphData;
  etag: string;
}

function withEtag(data: GraphData, headers: Headers): GraphSnapshot {
  const etag = headers.get('ETag');
  if (!etag) throw new ApiError({ kind: 'parse', message: 'В ответе отсутствует ETag графа.' });
  return { graph: data, etag };
}

export async function fetchGraph(spaceId: string, signal?: AbortSignal): Promise<GraphSnapshot> {
  const { data, headers } = await request<GraphData>({
    path: `/api/spaces/${spaceId}/graph`,
    signal,
  });
  return withEtag(data, headers);
}

export async function saveGraph(
  spaceId: string,
  graph: GraphData,
  etag: string,
  signal?: AbortSignal,
): Promise<GraphSnapshot> {
  const { data, headers } = await request<GraphData>({
    method: 'PUT',
    path: `/api/spaces/${spaceId}/graph`,
    headers: { 'If-Match': etag },
    body: graph,
    signal,
  });
  return withEtag(data, headers);
}
