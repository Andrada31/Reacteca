import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

/** Sets the tab title as "<title> · <site name>", or just the site name. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${siteConfig.name}` : `${siteConfig.name} · ${siteConfig.tagline}`;
  }, [title]);
}
