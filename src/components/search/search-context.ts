import { createContext, useContext } from 'react';

export interface SearchContextValue {
  openSearch: () => void;
}

export const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used inside <AppLayout>.');
  return context;
}
