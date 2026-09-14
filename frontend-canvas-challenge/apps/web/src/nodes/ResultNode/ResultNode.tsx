import type { NodeProps } from '@xyflow/react';
import { memo, useCallback } from 'react';
import { API_BASE_URL } from '../../api/client';
import { describeGenerationState } from '../../lib/generation-flow';
import type { GenerationAttempt } from '../../lib/generation-types';
import type { ResultNode as ResultNodeType } from '../../lib/graph-types';
import { useGenerationStore } from '../../store/generationStore';
import { useGraphStore } from '../../store/graphStore';
import { NodeShell } from '../NodeShell';
import styles from './ResultNode.module.css';

function findAttemptForResult(
  attempts: Record<string, GenerationAttempt>,
  resultNodeId: string,
): GenerationAttempt | undefined {
  for (const attempt of Object.values(attempts)) {
    if (attempt.resultNodeId === resultNodeId) return attempt;
  }
  return undefined;
}

function ResultNodeComponent({ id }: NodeProps<ResultNodeType>) {
  const deleteNode = useGraphStore((state) => state.deleteNode);
  const attempt = useGenerationStore((state) => findAttemptForResult(state.attempts, id));
  const handleDelete = useCallback(() => deleteNode(id), [id, deleteNode]);
  const { label: statusLabel, tone: statusTone } = describeGenerationState(attempt);

  return (
    <NodeShell
      title="Результат"
      hasTarget
      statusLabel={statusLabel}
      statusTone={statusTone}
      onDelete={handleDelete}
    >
      <div className={styles.frame}>
        {attempt?.status === 'succeeded' && attempt.imageUrl ? (
          <img
            className={styles.image}
            src={`${API_BASE_URL}${attempt.imageUrl}`}
            alt="Результат генерации"
            width={200}
            height={150}
            loading="lazy"
          />
        ) : (
          <span className={styles.placeholder}>
            {attempt?.status === 'processing' ? 'Идёт генерация…' : 'Изображения пока нет'}
          </span>
        )}
      </div>
    </NodeShell>
  );
}

export const ResultNode = memo(ResultNodeComponent);
