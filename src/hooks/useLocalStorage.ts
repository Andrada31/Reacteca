import { useCallback, useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

/** useState that persists to localStorage. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));

  const update = useCallback(
    (next: T) => {
      writeStorage(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, update] as const;
}
