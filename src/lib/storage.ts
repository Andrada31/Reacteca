/** Every localStorage key the app uses. */
export const storageKeys = {
  /** Also read by the inline script in index.html. */
  theme: 'reacteca:theme',
  promptOptions: 'reacteca:prompt-options',
  packageManager: 'reacteca:package-manager',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota). Preferences just won't persist.
  }
}
