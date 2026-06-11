import { useEffect, useRef } from 'react';
import { SITE_CONFIG } from '@/constants/site';
import { articles } from '@/features/article/data/articles';

/**
 * SEOManager subscribes to route changes via props and updates
 * document.title and meta[name="description"] accordingly.
 *
 * For article detail pages, it resolves the article by slug and
 * uses its title/excerpt for SEO metadata.
 *
 * Falls back to SITE_CONFIG.defaultMeta when metadata is null
 * or article is not found.
 *
 * Includes a visually hidden ARIA live region that announces
 * the new page title to screen readers.
 */
export function SEOManager({ route, params }) {
  const liveRegionRef = useRef(null);

  useEffect(() => {
    let title = route.meta?.title;
    let description = route.meta?.description;

    // Dynamic resolution for article detail pages
    if (route.meta?.id === 'artikel-detail' && params.slug) {
      const article = articles.find((a) => a.slug === params.slug);
      if (article) {
        title = article.title;
        description = article.excerpt;
      }
    }

    // Apply defaults if no metadata found
    if (!title) title = SITE_CONFIG.defaultMeta.title;
    if (!description) description = SITE_CONFIG.defaultMeta.description;

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Announce to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = title;
    }
  }, [route, params]);

  return (
    <div
      ref={liveRegionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
