import { describe, it, expect } from 'vitest';
import { matchRoute, resolveRoute } from './matchRoute';

describe('matchRoute', () => {
  describe('static segments', () => {
    it('matches exact static path', () => {
      expect(matchRoute('/profil', '/profil')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('matches root path', () => {
      expect(matchRoute('/', '/')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('does not match different static path', () => {
      expect(matchRoute('/profil', '/alumni')).toEqual({
        matched: false,
        params: {}
      });
    });

    it('does not match when segment count differs', () => {
      expect(matchRoute('/profil/detail', '/profil')).toEqual({
        matched: false,
        params: {}
      });
    });
  });

  describe('parameterized segments', () => {
    it('matches parameterized segment and extracts param', () => {
      expect(matchRoute('/artikel/:slug', '/artikel/my-post')).toEqual({
        matched: true,
        params: { slug: 'my-post' }
      });
    });

    it('extracts multiple params', () => {
      expect(matchRoute('/user/:id/post/:postId', '/user/42/post/99')).toEqual({
        matched: true,
        params: { id: '42', postId: '99' }
      });
    });

    it('URL-decodes parameter values', () => {
      expect(matchRoute('/artikel/:slug', '/artikel/hello%20world')).toEqual({
        matched: true,
        params: { slug: 'hello world' }
      });
    });

    it('URL-decodes special characters in params', () => {
      expect(matchRoute('/search/:query', '/search/caf%C3%A9')).toEqual({
        matched: true,
        params: { query: 'café' }
      });
    });
  });

  describe('wildcard', () => {
    it('wildcard matches any path', () => {
      expect(matchRoute('*', '/anything/here')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('wildcard matches root', () => {
      expect(matchRoute('*', '/')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('wildcard matches empty string', () => {
      expect(matchRoute('*', '')).toEqual({
        matched: true,
        params: {}
      });
    });
  });

  describe('trailing slashes and empty segments', () => {
    it('matches with trailing slash on pathname', () => {
      expect(matchRoute('/profil', '/profil/')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('matches with trailing slash on pattern', () => {
      expect(matchRoute('/profil/', '/profil')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('matches when both have trailing slashes', () => {
      expect(matchRoute('/profil/', '/profil/')).toEqual({
        matched: true,
        params: {}
      });
    });

    it('handles multiple consecutive slashes gracefully', () => {
      expect(matchRoute('/profil', '//profil//')).toEqual({
        matched: true,
        params: {}
      });
    });
  });
});

describe('resolveRoute', () => {
  const routes = [
    { path: '/', meta: { id: 'home' } },
    { path: '/profil', meta: { id: 'profil' } },
    { path: '/artikel/:slug', meta: { id: 'artikel-detail' } },
    { path: '*', meta: { id: 'not-found' } }
  ];

  it('resolves exact static match', () => {
    const result = resolveRoute(routes, '/profil');
    expect(result).toEqual({
      route: { path: '/profil', meta: { id: 'profil' } },
      params: {}
    });
  });

  it('resolves parameterized route', () => {
    const result = resolveRoute(routes, '/artikel/my-slug');
    expect(result).toEqual({
      route: { path: '/artikel/:slug', meta: { id: 'artikel-detail' } },
      params: { slug: 'my-slug' }
    });
  });

  it('falls back to wildcard for unmatched paths', () => {
    const result = resolveRoute(routes, '/nonexistent');
    expect(result).toEqual({
      route: { path: '*', meta: { id: 'not-found' } },
      params: {}
    });
  });

  it('returns first match when multiple could match (first-match-wins)', () => {
    const overlapping = [
      { path: '/artikel/:slug', meta: { id: 'first' } },
      { path: '/artikel/:id', meta: { id: 'second' } }
    ];
    const result = resolveRoute(overlapping, '/artikel/test');
    expect(result.route.meta.id).toBe('first');
  });

  it('returns null when no routes match and no wildcard', () => {
    const noWildcard = [
      { path: '/', meta: { id: 'home' } },
      { path: '/profil', meta: { id: 'profil' } }
    ];
    const result = resolveRoute(noWildcard, '/unknown');
    expect(result).toBeNull();
  });

  it('resolves root path correctly', () => {
    const result = resolveRoute(routes, '/');
    expect(result).toEqual({
      route: { path: '/', meta: { id: 'home' } },
      params: {}
    });
  });
});
