import { useState, useMemo } from 'react';
import { ArrowRight, ChevronRight, Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';
import { articles } from '../data/articles';
import IslamicPattern, { OrnamentalCorner } from './IslamicPattern';

export default function ArtikelList({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Categories list extracted from data
  const categories = useMemo(() => {
    const allCats = articles.map(a => a.category);
    return ['Semua', ...new Set(allCats)];
  }, []);

  // Filtered articles list based on selection
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'Semua') return articles;
    return articles.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  // Featured article (first one, only shown when category is 'Semua')
  const featuredArticle = useMemo(() => {
    if (selectedCategory !== 'Semua' || articles.length === 0) return null;
    return articles[0];
  }, [selectedCategory]);

  // Regular articles list (excluding the featured one if shown)
  const regularArticles = useMemo(() => {
    if (selectedCategory !== 'Semua') return filteredArticles;
    if (articles.length <= 1) return [];
    return filteredArticles.slice(1);
  }, [selectedCategory, filteredArticles]);

  return (
    <div className="py-8 md:py-12 px-4 max-w-6xl mx-auto space-y-10">
      {/* 1. Page Header / Breadcrumbs */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted">
          <button
            onClick={() => onNavigate('beranda')}
            className="hover:text-primary transition-standard focus-ring flex items-center gap-1 font-semibold"
          >
            Beranda
          </button>
          <ChevronRight className="icon-xs text-text-disabled" />
          <span className="text-primary font-bold" aria-current="page">Warta & Artikel</span>
        </nav>

        {/* Title */}
        <div className="text-center space-y-2 relative py-4">
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
            <IslamicPattern variant="arabesque" opacity={0.015} />
          </div>
          <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
            Kabar & Catatan Santri
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-primary font-bold">
            Warta & Artikel Pilihan
          </h1>
          <div className="h-1 w-20 bg-secondary mx-auto rounded-full mt-3"></div>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 border-b border-primary/10 pb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-full border transition-standard focus-ring ${
              selectedCategory === cat
                ? 'bg-primary border-primary text-secondary font-bold shadow-sm'
                : 'bg-bg-surface border-primary/10 text-text-muted hover:border-secondary hover:text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Empty State Check */}
      {filteredArticles.length === 0 && (
        <div className="bg-bg-surface border border-primary/5 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="icon-lg text-text-disabled mx-auto animate-bounce-subtle" />
          <h3 className="text-heading-lg text-primary">Artikel Tidak Ditemukan</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Maaf, belum ada artikel yang dipublikasikan dalam kategori <strong>{selectedCategory}</strong> saat ini.
          </p>
          <button
            onClick={() => setSelectedCategory('Semua')}
            className="btn-secondary focus-ring text-xs py-2 px-4 font-bold"
          >
            Tampilkan Semua Artikel
          </button>
        </div>
      )}

      {/* 4. Featured Post (Only when 'Semua' is selected & there is a post) */}
      {featuredArticle && (
        <div className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-standard card-interactive relative text-left flex flex-col lg:flex-row gap-8 p-6 md:p-8">
          <OrnamentalCorner position="top-left" size="sm" className="text-secondary/10" />
          <div className="w-full lg:w-1/2 shrink-0 rounded-2xl overflow-hidden shadow-inner">
            <img
              src={featuredArticle.image}
              alt={featuredArticle.title}
              className="w-full h-60 sm:h-72 object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-between py-2 flex-grow space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-text-muted font-semibold">
                <span className="px-3 py-1 bg-primary/5 text-primary rounded-full uppercase tracking-wider text-[10px]">
                  {featuredArticle.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="icon-xs text-secondary" />
                  {featuredArticle.date}
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-primary font-bold hover:text-secondary transition-standard leading-tight">
                <button
                  onClick={() => onNavigate('artikel-detail', featuredArticle.slug)}
                  className="text-left focus:outline-none hover:underline focus-ring"
                >
                  {featuredArticle.title}
                </button>
              </h2>
              <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                {featuredArticle.excerpt}
              </p>
            </div>
            <button
              onClick={() => onNavigate('artikel-detail', featuredArticle.slug)}
              className="btn-primary focus-ring text-xs font-bold self-start mt-2 px-5 py-2.5"
            >
              Baca Selengkapnya
              <ArrowRight className="icon-xs" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Regular Articles Grid */}
      {regularArticles.length > 0 && (
        <div className="space-y-6 text-left">
          {featuredArticle && (
            <h3 className="text-heading-lg text-primary font-bold border-b border-primary/5 pb-2">
              Artikel Lainnya
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((post) => (
              <article
                key={post.slug}
                className="bg-bg-surface border border-primary/5 hover:border-secondary/35 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-standard flex flex-col justify-between card-interactive"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-secondary text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-secondary" />
                        By Humas
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-primary line-clamp-2 hover:text-secondary transition-standard">
                      {post.title}
                    </h4>
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('artikel-detail', post.slug)}
                    className="btn-tertiary text-xs font-bold flex items-center gap-1 self-start mt-2"
                  >
                    Baca Selengkapnya
                    <ChevronRight className="icon-xs" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 6. Footer Back Action */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => onNavigate('beranda')}
          className="btn-secondary focus-ring flex items-center gap-2 font-bold px-6 py-2.5 text-xs sm:text-sm"
        >
          <ArrowLeft className="icon-xs" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
