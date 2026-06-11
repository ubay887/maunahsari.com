import { Suspense, useEffect } from 'react';
import { resolveRoute } from './matchRoute';
import { routes } from './routes';
import { SEOManager } from './SEOManager';
import { ErrorBoundary } from './ErrorBoundary';
import { useNavigation } from '@/contexts/NavigationContext';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]" role="status">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-secondary rounded-full animate-spin" />
      <span className="sr-only">Memuat halaman...</span>
    </div>
  );
}

export function Router() {
  const { currentPath } = useNavigation();
  const resolved = resolveRoute(routes, currentPath);

  const { route, params } = resolved || {
    route: routes.find(r => r.path === '*'),
    params: {}
  };

  const PageComponent = route.component;

  // Focus management: move focus to main or first h1 after route change (a11y requirement 9.3)
  useEffect(() => {
    const main = document.querySelector('main') || document.querySelector('#main-content');
    const h1 = main?.querySelector('h1');
    const target = h1 || main;
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }, [currentPath]);

  return (
    <>
      <SEOManager route={route} params={params} />
      <ErrorBoundary key={currentPath}>
        <Suspense fallback={<LoadingFallback />}>
          <PageComponent params={params} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
