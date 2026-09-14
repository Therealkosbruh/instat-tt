export interface SaveQueue {
  markDirty: () => void;
  flush: () => Promise<void>;
}

export interface SaveQueueOptions {
  getDebounceMs: () => number;
  save: (signal: AbortSignal) => Promise<void>;
}

export function createSaveQueue(options: SaveQueueOptions): SaveQueue {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight = false;
  let queuedAfterFlight = false;
  let waiters: Array<() => void> = [];

  const clearTimer = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const runSave = async (): Promise<void> => {
    inFlight = true;
    try {
      await options.save(controller.signal);
    } finally {
      inFlight = false;
      const resolved = waiters;
      waiters = [];
      resolved.forEach((resolve) => resolve());
      if (queuedAfterFlight) {
        queuedAfterFlight = false;
        void runSave();
      }
    }
  };

  const triggerSave = (): Promise<void> => {
    if (inFlight) {
      queuedAfterFlight = true;
      return new Promise((resolve) => waiters.push(resolve));
    }
    return runSave();
  };

  const markDirty = (): void => {
    clearTimer();
    timer = setTimeout(() => {
      timer = undefined;
      void triggerSave();
    }, options.getDebounceMs());
  };

  const flush = (): Promise<void> => {
    clearTimer();
    return triggerSave();
  };

  return { markDirty, flush };
}
