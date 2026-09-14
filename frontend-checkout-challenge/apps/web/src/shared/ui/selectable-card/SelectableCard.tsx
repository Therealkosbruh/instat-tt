import type { ReactElement, ReactNode } from 'react';
import { joinClassNames } from '@/shared/lib/join-class-names';
import { Icon } from '../icon/Icon';
import styles from './SelectableCard.module.scss';

interface SelectableCardProps {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  meta?: ReactNode;
  className?: string;
}

export function SelectableCard({
  selected,
  disabled = false,
  onSelect,
  title,
  description,
  meta,
  className,
}: SelectableCardProps): ReactElement {
  return (
    <button
      type="button"
      className={joinClassNames(
        styles.card,
        selected && styles.isSelected,
        disabled && styles.isDisabled,
        className,
      )}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.check} aria-hidden="true">
        {selected && <Icon name="check" size={14} />}
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {meta && <span className={styles.meta}>{meta}</span>}
    </button>
  );
}
