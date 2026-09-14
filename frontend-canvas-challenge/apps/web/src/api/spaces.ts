import type { SpaceData } from '@canvas/contracts';
import { request } from './client';

export async function listSpaces(signal?: AbortSignal): Promise<SpaceData[]> {
  const { data } = await request<SpaceData[]>({ path: '/api/spaces', signal });
  return data;
}

export async function createSpace(title: string, signal?: AbortSignal): Promise<SpaceData> {
  const { data } = await request<SpaceData>({
    method: 'POST',
    path: '/api/spaces',
    body: { title },
    signal,
  });
  return data;
}

export async function getSpace(spaceId: string, signal?: AbortSignal): Promise<SpaceData> {
  const { data } = await request<SpaceData>({ path: `/api/spaces/${spaceId}`, signal });
  return data;
}
