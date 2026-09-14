import type { ReactElement } from 'react';
import Link from 'next/link';
import { Icon } from '../icon/Icon';
import { CONTENT_BY_STATUS, type InfoBlockStatus } from './lib/content-by-status';
import styles from './InfoBlock.module.scss';

interface InfoBlockProps {
  status: InfoBlockStatus;
  title?: string;
  text?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function InfoBlock({
  status,
  title,
  text,
  actionLabel,
  actionHref,
  onAction,
}: InfoBlockProps): ReactElement {
  const content = CONTENT_BY_STATUS[status];

  return (
    <div className={styles.wrapper} role={status === 'error' ? 'alert' : undefined}>
      <div className={styles.iconCircle}>
        <Icon name={content.icon} size={28} />
      </div>
      <h2 className={styles.title}>{title ?? content.title}</h2>
      <p className={styles.text}>{text ?? content.text}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={styles.action}>
          {actionLabel}
        </Link>
      )}
      {onAction && actionLabel && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface InfoBlockSkeletonProps {
  count?: number;
}

export function InfoBlockSkeleton({ count = 8 }: InfoBlockSkeletonProps): ReactElement {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.skCard} style={{ animationDelay: `${index * 0.15}s` }}>
          <div className={styles.skCardImg} />
          <div className={styles.skLine} />
        </div>
      ))}
    </div>
  );
}
