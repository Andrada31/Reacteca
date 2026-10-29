import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

/** A viewport point (client coordinates) the next theme grows out of. */
export interface ThemeOrigin {
  x: number;
  y: number;
}

export interface ThemeContextValue {
  theme: Theme;
  /** Applies a theme; with an origin, it spreads from that point as a circle. */
  setTheme: (theme: Theme, origin?: ThemeOrigin) => void;
  /** Switches between light and dark. */
  toggle: (origin?: ThemeOrigin) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return context;
}
