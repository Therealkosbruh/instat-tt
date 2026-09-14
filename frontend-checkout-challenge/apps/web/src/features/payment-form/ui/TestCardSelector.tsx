import type { ReactElement } from 'react';
import type { Sandbox } from '@/entities/payment/api/payment';
import { Button } from '@/shared/ui/button/Button';
import { SelectableCard } from '@/shared/ui/selectable-card/SelectableCard';
import styles from './TestCardSelector.module.scss';

interface TestCardSelectorProps {
  cards: Sandbox['cards'];
  selectedCardId: string | undefined;
  onSelect: (id: string) => void;
  onPay: () => void;
  onCancel: () => void;
  isBusy: boolean;
  error: string | undefined;
}

export function TestCardSelector({
  cards,
  selectedCardId,
  onSelect,
  onPay,
  onCancel,
  isBusy,
  error,
}: TestCardSelectorProps): ReactElement {
  return (
    <div className={styles.wrapper} role="group" aria-label="Тестовая карта">
      <div className={styles.cards}>
        {cards.map((card) => (
          <SelectableCard
            key={card.id}
            selected={selectedCardId === card.id}
            onSelect={() => onSelect(card.id)}
            title={card.title}
            meta={card.maskedNumber}
          />
        ))}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} loading={isBusy} disabled={isBusy}>
          Отмена
        </Button>
        <Button onClick={onPay} loading={isBusy} disabled={isBusy || !selectedCardId}>
          Оплатить
        </Button>
      </div>
    </div>
  );
}
