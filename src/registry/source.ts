import type { CodeLanguage } from './types';

const languageByExtension: Record<string, CodeLanguage> = {
  tsx: 'tsx',
  ts: 'ts',
  jsx: 'jsx',
  js: 'js',
  mjs: 'js',
  css: 'css',
  scss: 'css',
  json: 'json',
  md: 'markdown',
  sh: 'bash',
};

export function detectLanguage(filename: string): CodeLanguage {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return languageByExtension[extension] ?? 'plain';
}

// Components first, then helpers, then styles.
const fileRank: Partial<Record<CodeLanguage, number>> = { tsx: 0, jsx: 0, ts: 1, js: 1, css: 2 };

/**
 * Picks and orders the files shown in the Code tab. An explicit list from
 * meta.ts wins; otherwise every file is shown, components first.
 */
export function orderSourceFiles(available: string[], explicit?: string[]): string[] {
  if (explicit?.length) {
    return explicit.filter((name) => available.includes(name));
  }
  return [...available].sort((a, b) => {
    const rankA = fileRank[detectLanguage(a)] ?? 3;
    const rankB = fileRank[detectLanguage(b)] ?? 3;
    return rankA - rankB || a.localeCompare(b);
  });
}

/** Trims trailing whitespace so code blocks don't end on a blank line. */
export function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, '\n').trimEnd();
}
