import type { SpaceData } from '@canvas/contracts';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { createSpace, listSpaces } from '../../api/spaces';
import type { AsyncStatus } from '../../lib/async-status';
import { validateSpaceTitle } from '../../lib/validation';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [title, setTitle] = useState('Мой канвас');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    listSpaces(controller.signal)
      .then((data) => {
        setSpaces(data);
        setStatus('loaded');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setStatus('error');
        setListError(isApiError(error) ? error.message : 'Не удалось загрузить пространства.');
      });
    return () => controller.abort();
  }, []);

  const handleCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validationMessage = validateSpaceTitle(title);
      setFieldError(validationMessage);
      if (validationMessage) return;
      setCreating(true);
      try {
        const space = await createSpace(title.trim());
        navigate(`/space/${space.id}`);
      } catch (error) {
        setFieldError(isApiError(error) ? error.message : 'Не удалось создать пространство.');
      } finally {
        setCreating(false);
      }
    },
    [title, navigate],
  );

  return (
    <div className={styles.page}>
      <h1>Канвас нод</h1>
      <form className={styles.form} onSubmit={(event) => void handleCreate(event)} noValidate>
        <div className={styles.field}>
          <label htmlFor="space-title">Название пространства</label>
          <input
            id="space-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? 'space-title-error' : undefined}
          />
        </div>
        <button type="submit" disabled={creating}>
          {creating ? 'Создаём…' : 'Создать и открыть'}
        </button>
      </form>
      {fieldError && (
        <p id="space-title-error" className={styles.error}>
          {fieldError}
        </p>
      )}

      <h2>Существующие пространства</h2>
      {status === 'loading' && <p>Загрузка…</p>}
      {status === 'error' && <p className={styles.error}>{listError}</p>}
      {status === 'loaded' && spaces.length === 0 && <p>Пока нет ни одного пространства.</p>}
      <ul className={styles.list}>
        {spaces.map((space) => (
          <li key={space.id}>
            <Link to={`/space/${space.id}`}>{space.title}</Link>
            <span className={styles.date}>{new Date(space.createdAt).toLocaleString('ru-RU')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
