import type { ReactElement, ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/format-price';
import type { SummaryItem, SummaryLine } from './model/types';
import styles from './SummaryCard.module.scss';

interface SummaryCardProps {
  items?: SummaryItem[];
  lines: SummaryLine[];
  total: SummaryLine;
  action?: ReactNode;
}

export function SummaryCard({ items, lines, total, action }: SummaryCardProps): ReactElement {
  return (
    <aside className={styles.card}>
      {items && items.length > 0 && (
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span>
                {item.title} <span className={styles.quantity}>× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.lines}>
        {lines.map((line) => (
          <div key={line.label} className={styles.line}>
            <span>{line.label}</span>
            <span>{typeof line.value === 'number' ? formatPrice(line.value) : line.value}</span>
          </div>
        ))}
      </div>
      <div className={styles.total}>
        <span>{total.label}</span>
        <span>{typeof total.value === 'number' ? formatPrice(total.value) : total.value}</span>
      </div>
      {action}
    </aside>
  );
}
