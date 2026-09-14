import type { NodeProps } from '@xyflow/react';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getGeneratorReadiness } from '../../lib/connection-rules';
import { describeGenerationState } from '../../lib/generation-flow';
import type { GeneratorNode as GeneratorNodeType } from '../../lib/graph-types';
import { useGenerationStore } from '../../store/generationStore';
import { useGraphStore } from '../../store/graphStore';
import { NodeShell } from '../NodeShell';
import styles from './GeneratorNode.module.css';

function GeneratorNodeComponent({ id }: NodeProps<GeneratorNodeType>) {
  const spaceId = useGraphStore((state) => state.spaceId);
  const readiness = useGraphStore(
    useShallow((state) => getGeneratorReadiness(id, state.nodes, state.edges)),
  );
  const deleteNode = useGraphStore((state) => state.deleteNode);
  const attempt = useGenerationStore((state) => state.attempts[id]);
  const generate = useGenerationStore((state) => state.generate);
  const retry = useGenerationStore((state) => state.retry);

  const handleDelete = useCallback(() => deleteNode(id), [id, deleteNode]);

  const isBusy =
    attempt !== undefined &&
    !attempt.error &&
    (attempt.status === 'idle' || attempt.status === 'processing');
  const resultNodeId = readiness.resultNodeId;

  const runGeneration = useCallback(
    (scenario: 'success' | 'failure') => {
      if (!spaceId || !resultNodeId) return;
      void generate({ spaceId, nodeId: id, resultNodeId, scenario });
    },
    [spaceId, resultNodeId, id, generate],
  );

  const handleGenerate = useCallback(() => runGeneration('success'), [runGeneration]);
  const handleGenerateFailure = useCallback(() => runGeneration('failure'), [runGeneration]);

  const handleRetry = useCallback(() => {
    if (!spaceId) return;
    retry({ spaceId, nodeId: id });
  }, [spaceId, id, retry]);

  const { label: statusLabel, tone: statusTone } = describeGenerationState(attempt);

  return (
    <NodeShell
      title="Генератор"
      hasTarget
      hasSource
      statusLabel={statusLabel}
      statusTone={statusTone}
      onDelete={handleDelete}
    >
      <p className={styles.hint}>{readiness.ready ? 'Готово к генерации' : readiness.reason}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className="nodrag"
          disabled={!readiness.ready || isBusy}
          onClick={handleGenerate}
        >
          Сгенерировать
        </button>
        <button
          type="button"
          className="nodrag"
          disabled={!readiness.ready || isBusy}
          onClick={handleGenerateFailure}
          title="Тестовый сценарий отказа генерации"
        >
          Проверить отказ
        </button>
        {attempt?.error && (
          <button type="button" className="nodrag" onClick={handleRetry}>
            Повторить
          </button>
        )}
      </div>
      {attempt?.error && <p className={styles.error}>{attempt.error.message}</p>}
      {!attempt?.error && attempt?.status === 'failed' && (
        <p className={styles.error}>
          Генерация завершилась отказом ({attempt.failureCode ?? 'сценарий failure'}).
        </p>
      )}
    </NodeShell>
  );
}

export const GeneratorNode = memo(GeneratorNodeComponent);
