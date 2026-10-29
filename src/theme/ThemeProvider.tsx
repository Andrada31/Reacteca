import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { easeOut } from '@/lib/motion';
import { readStorage, storageKeys, writeStorage } from '@/lib/storage';
import { ThemeContext, type Theme, type ThemeOrigin } from './theme-context';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/** The saved theme; on a first visit, whichever the OS prefers. Mirrors the inline script in index.html. */
function readTheme(): Theme {
  const stored = readStorage<unknown>(storageKeys.theme, null);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Grows the new theme's snapshot out of `origin` until the circle covers the viewport. */
function revealFrom({ x, y }: ThemeOrigin) {
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 350, easing: `cubic-bezier(${easeOut.join(', ')})`, pseudoElement: '::view-transition-new(root)' },
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const setTheme = useCallback(
    (next: Theme, origin?: ThemeOrigin) => {
      writeStorage(storageKeys.theme, next);
      if (next === theme) return;
      const commit = () => {
        applyTheme(next);
        flushSync(() => setThemeState(next));
      };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!document.startViewTransition || reduceMotion) {
        commit();
        return;
      }
      const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      // `ready` rejects when a newer switch skips this one; that switch runs its own reveal.
      document.startViewTransition(commit).ready.then(() => revealFrom(origin ?? center), () => {});
    },
    [theme],
  );

  const toggle = useCallback(
    (origin?: ThemeOrigin) => setTheme(theme === 'dark' ? 'light' : 'dark', origin),
    [theme, setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
