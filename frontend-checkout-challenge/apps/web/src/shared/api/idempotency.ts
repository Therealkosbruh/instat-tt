'use client';

import { useCallback, useRef } from 'react';

interface IdempotencyKeyController {
  getKey: () => string;
  renew: () => string;
}

export function useIdempotencyKey(): IdempotencyKeyController {
  const keyRef = useRef<string>(crypto.randomUUID());

  const getKey = useCallback(() => keyRef.current, []);
  const renew = useCallback(() => {
    keyRef.current = crypto.randomUUID();
    return keyRef.current;
  }, []);

  return { getKey, renew };
}
