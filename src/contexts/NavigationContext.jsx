/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { routes } from '@/router/routes';
import { resolveRoute } from '@/router/matchRoute';

const NavigationContext = createContext(null);

/**
 * Build a lookup map from route meta.id → route.path.
 * This allows components to navigate by page ID (e.g. 'profil')
 * instead of raw URL paths.
 */
const idToPathMap = {};
const idToPatternMap = {};
for (const route of routes) {
  if (route.meta?.id && route.path !== '*') {
    idToPathMap[route.meta.id] = route.path;
    idToPatternMap[route.meta.id] = route.path;
  }
}

/**
 * Resolves a navigation target (page ID or URL path) to an actual URL path.
 * - If the target matches a known page ID, returns the corresponding path.
 *   If the path contains :param placeholders, replaces the first one with `param`.
 * - If the target starts with '/', it's already a path — use as-is.
 * - Otherwise, try prepending '/' as a fallback.
 */
function resolveTarget(target, param) {
  const pattern = idToPatternMap[target];
  if (pattern !== undefined) {
    if (param && pattern.includes(':')) {
      // Replace the first :param segment with the actual value
      return pattern.replace(/:[^/]+/, encodeURIComponent(param));
    }
    return pattern;
  }
  if (target.startsWith('/')) {
    return target;
  }
  return `/${target}`;
}

export function NavigationProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const navigate = useCallback((target, param) => {
    const path = resolveTarget(target, param);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Derive the active page ID from the current path using route matching
  const activePage = useMemo(() => {
    const resolved = resolveRoute(routes, currentPath);
    return resolved?.route?.meta?.id || 'not-found';
  }, [currentPath]);

  const value = useMemo(() => ({
    currentPath,
    activePage,
    navigate,
    goBack
  }), [currentPath, activePage, navigate, goBack]);

  return (
    <NavigationContext value={value}>
      {children}
    </NavigationContext>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
