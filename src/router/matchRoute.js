/**
 * Matches a URL path against a route pattern.
 * Supports static segments, parameterized segments (:param), and wildcard (*).
 *
 * @param {string} pattern - Route pattern (e.g., '/artikel/:slug')
 * @param {string} pathname - Current URL path (e.g., '/artikel/my-post')
 * @returns {{ matched: boolean, params: Record<string, string> }}
 */
export function matchRoute(pattern, pathname) {
  if (pattern === '*') {
    return { matched: true, params: {} };
  }

  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return { matched: false, params: {} };
  }

  const params = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const seg = patternSegments[i];
    const val = pathSegments[i];

    if (seg.startsWith(':')) {
      params[seg.slice(1)] = decodeURIComponent(val);
    } else if (seg !== val) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

/**
 * Resolves the matching route from the routes array (first-match-wins).
 *
 * @param {Array} routes - Route configuration array
 * @param {string} pathname - Current URL path
 * @returns {{ route: object, params: Record<string, string> } | null}
 */
export function resolveRoute(routes, pathname) {
  for (const route of routes) {
    const result = matchRoute(route.path, pathname);
    if (result.matched) {
      return { route, params: result.params };
    }
  }
  return null;
}
