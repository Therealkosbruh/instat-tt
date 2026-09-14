import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { Connection, EdgeChange, NodeChange } from '@xyflow/react';
import { create } from 'zustand';
import { ApiError, isAbortError, toApiError } from '../api/client';
import { fetchGraph, saveGraph } from '../api/graph';
import { buildNodeTypeIndex, getEdgesForNode, validateConnection } from '../lib/connection-rules';
import { fromApiGraph, toApiGraph } from '../lib/graph-mapper';
import { getSaveTarget, type SaveStatus } from '../lib/graph-save-guard';
import type { AppEdge, AppNode, AppNodeType, Viewport } from '../lib/graph-types';
import type { AsyncStatus } from '../lib/async-status';
import { createNode } from '../lib/node-factory';
import { createSaveQueue } from '../lib/save-queue';
import { getEffectiveConfig } from './configStore';
import { useGenerationStore } from './generationStore';

export type LoadStatus = AsyncStatus;

const EMPTY_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

interface GraphState {
  spaceId: string | null;
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: Viewport;
  etag: string | null;
  editVersion: number;
  savedVersion: number;
  saveStatus: SaveStatus;
  saveError: ApiError | null;
  loadStatus: LoadStatus;
  loadError: ApiError | null;
  notice: string | null;

  loadGraph: (spaceId: string) => Promise<void>;
  rereadGraph: () => Promise<void>;
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: AppNodeType) => void;
  updatePromptText: (nodeId: string, text: string) => void;
  deleteNode: (nodeId: string) => void;
  setViewport: (viewport: Viewport) => void;
  flushAndWaitForSave: () => Promise<{ ok: boolean; etag: string | null }>;
  retrySave: () => void;
  dismissNotice: () => void;
}

function applyLoadedGraph(
  graph: Parameters<typeof fromApiGraph>[0],
  etag: string,
): Pick<
  GraphState,
  | 'nodes'
  | 'edges'
  | 'viewport'
  | 'etag'
  | 'editVersion'
  | 'savedVersion'
  | 'saveStatus'
  | 'saveError'
> {
  const mapped = fromApiGraph(graph);
  return {
    nodes: mapped.nodes,
    edges: mapped.edges,
    viewport: mapped.viewport,
    etag,
    editVersion: 0,
    savedVersion: 0,
    saveStatus: 'saved',
    saveError: null,
  };
}

export const useGraphStore = create<GraphState>((set, get) => {
  const scheduleSave = (): void => {
    set((state) => ({ editVersion: state.editVersion + 1 }));
    saveQueue.markDirty();
  };

  const performSave = async (signal: AbortSignal): Promise<void> => {
    const state = get();
    const target = getSaveTarget(state);
    if (!target) return;

    const versionAtStart = state.editVersion;
    set({ saveStatus: 'saving', saveError: null });
    const payload = toApiGraph(state.nodes, state.edges, state.viewport);

    try {
      const { etag } = await saveGraph(target.spaceId, payload, target.etag, signal);
      set({ etag, savedVersion: versionAtStart, saveStatus: 'saved', saveError: null });
    } catch (error) {
      if (isAbortError(error)) return;
      const apiError = toApiError(error);
      set(
        apiError.status === 412 || apiError.status === 428
          ? { saveStatus: 'conflict', saveError: apiError }
          : { saveStatus: 'error', saveError: apiError },
      );
    }
  };

  const saveQueue = createSaveQueue({
    getDebounceMs: () => getEffectiveConfig().debounceMs,
    save: performSave,
  });

  return {
    spaceId: null,
    nodes: [],
    edges: [],
    viewport: EMPTY_VIEWPORT,
    etag: null,
    editVersion: 0,
    savedVersion: 0,
    saveStatus: 'idle',
    saveError: null,
    loadStatus: 'idle',
    loadError: null,
    notice: null,

    loadGraph: async (spaceId) => {
      set({
        spaceId: null,
        nodes: [],
        edges: [],
        viewport: EMPTY_VIEWPORT,
        etag: null,
        editVersion: 0,
        savedVersion: 0,
        saveStatus: 'idle',
        saveError: null,
        loadStatus: 'loading',
        loadError: null,
        notice: null,
      });
      try {
        const { graph, etag } = await fetchGraph(spaceId);
        set({ spaceId, loadStatus: 'loaded', loadError: null, ...applyLoadedGraph(graph, etag) });
      } catch (error) {
        set({ spaceId, loadStatus: 'error', loadError: toApiError(error) });
      }
    },

    rereadGraph: async () => {
      const state = get();
      if (!state.spaceId) return;
      set({ loadStatus: 'loading' });
      try {
        const { graph, etag } = await fetchGraph(state.spaceId);
        set({
          loadStatus: 'loaded',
          loadError: null,
          notice: null,
          ...applyLoadedGraph(graph, etag),
        });
      } catch (error) {
        set({ loadStatus: 'error', loadError: toApiError(error) });
      }
    },

    onNodesChange: (changes) => {
      set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
      if (changes.some((change) => change.type === 'position')) scheduleSave();
    },

    onEdgesChange: (changes) => {
      set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
    },

    onConnect: (connection) => {
      if (!connection.source || !connection.target) return;
      const state = get();
      const maxEdges = getEffectiveConfig().maxEdges;
      if (state.edges.length >= maxEdges) {
        set({ notice: `Достигнут лимит связей: ${maxEdges}.` });
        return;
      }
      const nodeTypes = buildNodeTypeIndex(state.nodes);
      const validation = validateConnection(connection, nodeTypes, state.edges);
      if (!validation.valid) {
        set({ notice: validation.reason ?? 'Недопустимое соединение.' });
        return;
      }
      const edge: AppEdge = {
        id: crypto.randomUUID(),
        source: connection.source,
        target: connection.target,
      };
      set((current) => ({ edges: [...current.edges, edge], notice: null }));
      scheduleSave();
    },

    addNode: (type) => {
      const state = get();
      const maxNodes = getEffectiveConfig().maxNodes;
      if (state.nodes.length >= maxNodes) {
        set({ notice: `Достигнут лимит нод: ${maxNodes}.` });
        return;
      }
      const node = createNode(type, state.nodes);
      set((current) => ({ nodes: [...current.nodes, node], notice: null }));
      scheduleSave();
    },

    updatePromptText: (nodeId, text) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId && node.type === 'prompt' ? { ...node, data: { text } } : node,
        ),
      }));
      scheduleSave();
    },

    deleteNode: (nodeId) => {
      const state = get();
      if (!state.nodes.some((node) => node.id === nodeId)) return;
      const connectedEdges = getEdgesForNode(state.edges, nodeId);
      const connectedIds = new Set(connectedEdges.map((edge) => edge.id));
      set((current) => ({
        nodes: current.nodes.filter((node) => node.id !== nodeId),
        edges: connectedIds.size
          ? current.edges.filter((edge) => !connectedIds.has(edge.id))
          : current.edges,
      }));
      useGenerationStore.getState().removeForNode(nodeId);
      scheduleSave();
    },

    setViewport: (viewport) => {
      set({ viewport });
      scheduleSave();
    },

    flushAndWaitForSave: async () => {
      await saveQueue.flush();
      const state = get();
      const ok = state.saveStatus === 'saved' && state.editVersion === state.savedVersion;
      return { ok, etag: state.etag };
    },

    retrySave: () => {
      void saveQueue.flush();
    },

    dismissNotice: () => set({ notice: null }),
  };
});

export function useIsGraphDirty(): boolean {
  return useGraphStore((state) => state.editVersion !== state.savedVersion);
}
