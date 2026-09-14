import { isAbortError } from '../api/client';

export interface PollController {
  stop: () => void;
}

export interface PollOptions<T> {
  execute: (signal: AbortSignal) => Promise<T>;
  isDone: (result: T) => boolean;
  delayMs: (result: T | null) => number;
  onResult: (result: T) => void;
  onError: (error: unknown) => void;
}

export function startPolling<T>(options: PollOptions<T>): PollController {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = true;

  const stop = (): void => {
    if (!active) return;
    active = false;
    controller.abort();
    if (timer !== undefined) clearTimeout(timer);
  };

  const tick = async (): Promise<void> => {
    if (!active) return;
    try {
      const result = await options.execute(controller.signal);
      if (!active) return;
      options.onResult(result);
      if (options.isDone(result)) {
        stop();
        return;
      }
      timer = setTimeout(() => void tick(), options.delayMs(result));
    } catch (error) {
      if (!active) return;
      if (isAbortError(error)) return;
      options.onError(error);
    }
  };

  timer = setTimeout(() => void tick(), options.delayMs(null));
  return { stop };
}
