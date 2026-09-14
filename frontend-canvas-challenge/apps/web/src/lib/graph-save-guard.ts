export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export interface SaveGuardState {
  saveStatus: SaveStatus;
  editVersion: number;
  savedVersion: number;
  spaceId: string | null;
  etag: string | null;
}

export interface SaveTarget {
  spaceId: string;
  etag: string;
}

export function getSaveTarget(state: SaveGuardState): SaveTarget | null {
  if (state.saveStatus === 'conflict') return null;
  if (!state.spaceId || !state.etag) return null;
  if (state.editVersion === state.savedVersion && state.saveStatus === 'saved') return null;
  return { spaceId: state.spaceId, etag: state.etag };
}
