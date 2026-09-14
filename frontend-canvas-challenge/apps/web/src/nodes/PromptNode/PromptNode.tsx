import type { NodeProps } from '@xyflow/react';
import { memo, useCallback } from 'react';
import type { PromptNode as PromptNodeType } from '../../lib/graph-types';
import { useGraphStore } from '../../store/graphStore';
import { NodeShell } from '../NodeShell';
import styles from './PromptNode.module.css';

function PromptNodeComponent({ id, data }: NodeProps<PromptNodeType>) {
  const updatePromptText = useGraphStore((state) => state.updatePromptText);
  const deleteNode = useGraphStore((state) => state.deleteNode);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => updatePromptText(id, event.target.value),
    [id, updatePromptText],
  );
  const handleDelete = useCallback(() => deleteNode(id), [id, deleteNode]);

  return (
    <NodeShell title="Текст" hasSource onDelete={handleDelete}>
      <label className={styles.label} htmlFor={`prompt-text-${id}`}>
        Описание изображения
      </label>
      <textarea
        id={`prompt-text-${id}`}
        className={`${styles.textarea} nodrag`}
        value={data.text}
        maxLength={2000}
        rows={4}
        placeholder="Например: горы на рассвете"
        onChange={handleChange}
      />
      <span className={styles.counter}>{data.text.length}/2000</span>
    </NodeShell>
  );
}

export const PromptNode = memo(PromptNodeComponent);
