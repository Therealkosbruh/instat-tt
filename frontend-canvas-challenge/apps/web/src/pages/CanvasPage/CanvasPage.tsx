import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ComponentProps } from 'react';
import { useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listGenerations } from '../../api/generations';
import { SaveStatusBar } from '../../components/SaveStatusBar';
import { buildNodeTypeIndex, validateConnection } from '../../lib/connection-rules';
import type { AppNodeType } from '../../lib/graph-types';
import { nodeTypes } from '../../nodes';
import { useConfigStore } from '../../store/configStore';
import { useGenerationStore } from '../../store/generationStore';
import { useGraphStore } from '../../store/graphStore';
import styles from './CanvasPage.module.css';

const ADD_NODE_OPTIONS: Array<{ type: AppNodeType; label: string }> = [
  { type: 'prompt', label: '+ Текст' },
  { type: 'generator', label: '+ Генератор' },
  { type: 'result', label: '+ Результат' },
];

type FlowProps = ComponentProps<typeof ReactFlow>;
type IsValidConnection = NonNullable<FlowProps['isValidConnection']>;
type MoveEndHandler = NonNullable<FlowProps['onMoveEnd']>;

export function CanvasPage() {
  const { id: spaceId } = useParams<{ id: string }>();
  const loadConfig = useConfigStore((state) => state.load);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const viewport = useGraphStore((state) => state.viewport);
  const loadStatus = useGraphStore((state) => state.loadStatus);
  const loadError = useGraphStore((state) => state.loadError);
  const notice = useGraphStore((state) => state.notice);
  const dismissNotice = useGraphStore((state) => state.dismissNotice);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const addNode = useGraphStore((state) => state.addNode);
  const setViewport = useGraphStore((state) => state.setViewport);
  const loadGraph = useGraphStore((state) => state.loadGraph);
  const resumeFromHistory = useGenerationStore((state) => state.resumeFromHistory);
  const stopAllGenerations = useGenerationStore((state) => state.stopAll);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (!spaceId) return;
    void loadGraph(spaceId);
    return () => stopAllGenerations();
  }, [spaceId, loadGraph, stopAllGenerations]);

  useEffect(() => {
    if (!spaceId || loadStatus !== 'loaded') return;
    const controller = new AbortController();
    listGenerations(spaceId, controller.signal)
      .then((generations) => {
        const currentIds = new Set(useGraphStore.getState().nodes.map((node) => node.id));
        resumeFromHistory(spaceId, generations, currentIds);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [spaceId, loadStatus, resumeFromHistory]);

  const isValidConnection = useCallback<IsValidConnection>((connection) => {
    const state = useGraphStore.getState();
    const index = buildNodeTypeIndex(state.nodes);
    return validateConnection(connection, index, state.edges).valid;
  }, []);

  const handleMoveEnd = useCallback<MoveEndHandler>(
    (_event, nextViewport) => setViewport(nextViewport),
    [setViewport],
  );

  if (!spaceId) return <p className={styles.status}>Пространство не найдено.</p>;

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.leftGroup}>
          <Link to="/" className={styles.backButton}>
            ← Назад
          </Link>
          <div className={styles.addButtons}>
            {ADD_NODE_OPTIONS.map((option) => (
              <button key={option.type} type="button" onClick={() => addNode(option.type)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <SaveStatusBar />
      </header>
      {notice && (
        <div className={styles.notice} role="alert">
          <span>{notice}</span>
          <button type="button" onClick={dismissNotice} aria-label="Скрыть сообщение">
            ×
          </button>
        </div>
      )}
      {loadStatus === 'loading' && <p className={styles.status}>Загрузка графа…</p>}
      {loadStatus === 'error' && (
        <p className={styles.status}>
          Не удалось загрузить граф{loadError ? `: ${loadError.message}` : ''}.
        </p>
      )}
      <div className={styles.canvas}>
        <ReactFlow
          key={spaceId}
          nodes={nodes}
          edges={edges}
          defaultViewport={viewport}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onMoveEnd={handleMoveEnd}
          deleteKeyCode={null}
          fitView={nodes.length > 0}
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}
