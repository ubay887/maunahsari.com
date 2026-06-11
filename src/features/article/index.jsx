import ArtikelList from './components/ArtikelList';
import ArtikelDetail from './components/ArtikelDetail';

export { ArtikelList, ArtikelDetail };

/**
 * Article page router.
 * Renders ArtikelDetail if a slug param is present, otherwise ArtikelList.
 */
export default function ArticlePage({ params }) {
  const slug = params?.slug;

  if (slug) {
    return <ArtikelDetail articleSlug={slug} />;
  }

  return <ArtikelList />;
}
