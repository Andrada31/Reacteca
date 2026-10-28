import { getCategory } from './categories';
import { allComponents } from './registry';
import type { ComponentEntry } from './types';

function isSubsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function scoreToken(entry: ComponentEntry, token: string): number {
  const name = entry.name.toLowerCase();
  if (name === token) return 120;
  if (name.startsWith(token)) return 100;
  if (name.split(/\s+/).some((word) => word.startsWith(token))) return 80;
  if (name.includes(token)) return 60;
  if (entry.tags.some((tag) => tag.toLowerCase().startsWith(token))) return 45;
  if (getCategory(entry.category)?.label.toLowerCase().includes(token)) return 35;
  if (entry.slug.includes(token)) return 30;
  if (entry.description.toLowerCase().includes(token)) return 20;
  if (token.length > 1 && isSubsequence(token, name)) return 8;
  return 0;
}

/**
 * Ranked search over name, tags, category and description.
 * Every word in the query must match something.
 */
export function searchComponents(
  query: string,
  components: readonly ComponentEntry[] = allComponents,
): ComponentEntry[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...components];

  const ranked: Array<{ entry: ComponentEntry; score: number }> = [];
  for (const entry of components) {
    let score = 0;
    for (const token of tokens) {
      const tokenScore = scoreToken(entry, token);
      if (tokenScore === 0) {
        score = 0;
        break;
      }
      score += tokenScore;
    }
    if (score > 0) ranked.push({ entry, score });
  }

  return ranked
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .map(({ entry }) => entry);
}
