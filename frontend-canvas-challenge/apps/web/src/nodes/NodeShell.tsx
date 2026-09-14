import { Handle, Position } from '@xyflow/react';
import { memo, type ReactNode } from 'react';
import type { StatusTone } from '../lib/generation-types';
import styles from './NodeShell.module.css';

interface NodeShellProps {
  title: string;
  hasTarget?: boolean;
  hasSource?: boolean;
  statusLabel?: string;
  statusTone?: StatusTone;
  onDelete: () => void;
  children: ReactNode;
}

function NodeShellComponent({
  title,
  hasTarget = false,
  hasSource = false,
  statusLabel,
  statusTone = 'idle',
  onDelete,
  children,
}: NodeShellProps) {
  return (
    <div className={styles.shell}>
      {hasTarget && <Handle type="target" position={Position.Left} className={styles.handle} />}
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {statusLabel && (
          <span className={`${styles.status} ${styles[statusTone]}`}>{statusLabel}</span>
        )}
        <button
          type="button"
          className={`${styles.deleteButton} nodrag`}
          onClick={onDelete}
          aria-label={`Удалить ноду «${title}»`}
        >
          ×
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {hasSource && <Handle type="source" position={Position.Right} className={styles.handle} />}
    </div>
  );
}

export const NodeShell = memo(NodeShellComponent);
