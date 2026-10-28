import { MotionConfig } from 'framer-motion';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Spinner } from './components/ui/spinner';
import { TooltipProvider } from './components/ui/tooltip';
import { AppLayout } from './components/layout/AppLayout';
import { ThemeProvider } from './theme/ThemeProvider';

function PageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

// Pages are code-split; each loads on first visit.
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    HydrateFallback: PageLoader,
    children: [
      { index: true, lazy: () => import('./pages/HomePage').then((m) => ({ Component: m.HomePage })) },
      { path: 'components', lazy: () => import('./pages/ComponentsPage').then((m) => ({ Component: m.ComponentsPage })) },
      { path: 'components/:slug', lazy: () => import('./pages/ComponentPage').then((m) => ({ Component: m.ComponentPage })) },
      {
        path: 'getting-started',
        lazy: () => import('./pages/GettingStartedPage').then((m) => ({ Component: m.GettingStartedPage })),
      },
      { path: '*', lazy: () => import('./pages/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })) },
    ],
  },
  // Standalone, chrome-free preview (opened in a new tab from the Preview panel).
  {
    path: 'preview/:slug',
    HydrateFallback: PageLoader,
    lazy: () => import('./pages/PreviewPage').then((m) => ({ Component: m.PreviewPage })),
  },
]);

export function App() {
  return (
    <ThemeProvider>
      {/* Every framer-motion animation honours the OS "reduce motion" setting. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
