import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { easeOut } from '@/lib/motion';
import { CommandPalette } from '../search/CommandPalette';
import { SearchContext } from '../search/search-context';
import { Footer } from './Footer';
import { SiteHeader } from './SiteHeader';

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  // ⌘K / Ctrl+K toggles search; "/" opens it when not typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const search = useMemo(() => ({ openSearch: () => setSearchOpen(true) }), []);

  return (
    <SearchContext.Provider value={search}>
      <a
        href="#main"
        className="fixed top-2.5 left-2.5 z-100 -translate-y-[200%] rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* The page is a rounded sheet resting on the footer, like mobbin.com. */}
      <div className="relative z-10 flex min-h-dvh flex-col rounded-b-[2.5rem] bg-background">
        <SiteHeader />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-24 outline-none sm:px-6 lg:px-8 lg:pt-12 lg:pb-32"
        >
          {/* Each page fades up as it arrives; ?view= tab switches keep the same key. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <Footer />

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      {/* Keyed by path so switching tabs (?view=) keeps the scroll position. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </SearchContext.Provider>
  );
}
