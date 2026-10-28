import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { readStorage, storageKeys, writeStorage } from '@/lib/storage';
import { ThemeContext, type ResolvedTheme, type ThemePreference } from './theme-context';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference, system: ResolvedTheme): ResolvedTheme {
  return preference === 'system' ? system : preference;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readPreference(): ThemePreference {
  const stored = readStorage<string>(storageKeys.theme, 'system');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => 'light' as const);
  const resolved = resolveTheme(preference, systemTheme);

  // Keeps <html> in sync, including when the OS theme changes under "system".
  useEffect(() => applyTheme(resolved), [resolved]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      writeStorage(storageKeys.theme, next);
      const nextResolved = resolveTheme(next, systemTheme);
      const commit = () => {
        applyTheme(nextResolved);
        flushSync(() => setPreferenceState(next));
      };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (nextResolved !== resolved && document.startViewTransition && !reduceMotion) {
        document.startViewTransition(commit);
      } else {
        commit();
      }
    },
    [resolved, systemTheme],
  );

  const toggle = useCallback(
    () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
    [resolved, setPreference],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
