import type { SaveStatus } from '../lib/graph-save-guard';
import { useGraphStore, useIsGraphDirty } from '../store/graphStore';
import styles from './SaveStatusBar.module.css';

type StatusKey = 'saving' | 'conflict' | 'error' | 'dirty' | 'saved';

const STATUS_LABELS: Record<StatusKey, string> = {
  saving: 'Сохраняется…',
  conflict: 'Конфликт версий — перечитайте граф',
  error: 'Ошибка сохранения',
  dirty: 'Есть несохранённые изменения',
  saved: 'Сохранено',
};

const STATUS_KEY_BY_SAVE_STATUS: Record<SaveStatus, (dirty: boolean) => StatusKey> = {
  idle: (dirty) => (dirty ? 'dirty' : 'saved'),
  saving: () => 'saving',
  saved: (dirty) => (dirty ? 'dirty' : 'saved'),
  error: () => 'error',
  conflict: () => 'conflict',
};

function resolveStatusKey(saveStatus: SaveStatus, dirty: boolean): StatusKey {
  return STATUS_KEY_BY_SAVE_STATUS[saveStatus](dirty);
}

export function SaveStatusBar() {
  const saveStatus = useGraphStore((state) => state.saveStatus);
  const saveError = useGraphStore((state) => state.saveError);
  const rereadGraph = useGraphStore((state) => state.rereadGraph);
  const retrySave = useGraphStore((state) => state.retrySave);
  const dirty = useIsGraphDirty();
  const key = resolveStatusKey(saveStatus, dirty);

  return (
    <div className={`${styles.bar} ${styles[key]}`} role="status" aria-live="polite">
      <span>{STATUS_LABELS[key]}</span>
      {key === 'error' && saveError && <span className={styles.detail}>{saveError.message}</span>}
      {key === 'error' && (
        <button type="button" onClick={retrySave}>
          Повторить сохранение
        </button>
      )}
      {key === 'conflict' && (
        <button type="button" onClick={() => void rereadGraph()}>
          Перечитать граф
        </button>
      )}
    </div>
  );
}
