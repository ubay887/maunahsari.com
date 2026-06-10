import { useMemo } from 'react';
import { Calendar, User, ArrowLeft, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { articles } from '../data/articles';
import IslamicPattern, { OrnamentalCorner } from './IslamicPattern';

export default function ArtikelDetail({ articleSlug, onNavigate }) {
  // Find current article from slug
  const article = useMemo(() => {
    return articles.find(a => a.slug === articleSlug);
  }, [articleSlug]);

  // Find related articles (same category or others, max 3, excluding current)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const sameCat = articles.filter(a => a.category === article.category && a.slug !== article.slug);
    const others = articles.filter(a => a.category !== article.category && a.slug !== article.slug);
    return [...sameCat, ...others].slice(0, 3);
  }, [article]);

  // 1. Article Not Found State
  if (!article) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center space-y-6">
        <div className="bg-bg-surface border border-primary/5 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="icon-lg text-text-disabled mx-auto animate-bounce-subtle" />
          <h3 className="text-display-md text-primary font-bold">Artikel Tidak Ditemukan</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Maaf, artikel dengan kata kunci pencarian tersebut tidak dapat ditemukan atau sudah dihapus.
          </p>
          <button
            onClick={() => onNavigate('artikel')}
            className="btn-secondary focus-ring text-xs py-2 px-4 font-bold"
          >
            Lihat Semua Artikel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 px-4 max-w-6xl mx-auto space-y-8">
      {/* 2. Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <button
          onClick={() => onNavigate('beranda')}
          className="hover:text-primary transition-standard focus-ring flex items-center gap-1 font-semibold"
        >
          Beranda
        </button>
        <ChevronRight className="icon-xs text-text-disabled" />
        <button
          onClick={() => onNavigate('artikel')}
          className="hover:text-primary transition-standard focus-ring flex items-center gap-1 font-semibold"
        >
          Warta & Artikel
        </button>
        <ChevronRight className="icon-xs text-text-disabled" />
        <span className="text-primary font-bold line-clamp-1 max-w-[200px] sm:max-w-md" aria-current="page">
          {article.title}
        </span>
      </nav>

      {/* 3. Main Content Layout (Two Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Article Body (8 cols) */}
        <article className="lg:col-span-8 bg-bg-surface border border-primary/5 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden text-left space-y-6">
          <OrnamentalCorner position="top-left" size="sm" className="text-secondary/15" />
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <span className="inline-block px-2.5 py-0.5 bg-primary text-secondary text-[10px] font-bold rounded-md uppercase tracking-wider">
              {article.category}
            </span>
            <h1 className="font-display text-2xl md:text-4xl text-primary font-bold leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted border-y border-primary/15 py-3 font-semibold">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                Estimasi Baca 4 mnt
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="rounded-2xl overflow-hidden shadow-inner w-full">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto max-h-[380px] object-cover object-center"
            />
          </div>

          {/* HTML Render Body */}
          <div 
            className="prose prose-emerald max-w-none text-left"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Right Column: Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Sidebar Widget 1: Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm text-left space-y-4">
              <h3 className="font-display font-bold text-lg text-primary border-b border-primary/10 pb-2">
                Artikel Terkait
              </h3>
              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <button
                    key={rel.slug}
                    onClick={() => onNavigate('artikel-detail', rel.slug)}
                    className="flex gap-3 items-center group w-full text-left focus:outline-none focus-ring rounded-lg p-1 transition-standard hover:bg-primary/5"
                  >
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-16 h-16 object-cover rounded-lg shrink-0 border border-primary/5"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">
                        {rel.category}
                      </span>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-primary line-clamp-2 group-hover:text-secondary transition-standard group-hover:underline">
                        {rel.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Widget 2: PSB Registration Banner */}
          <div className="bg-primary text-bg-surface border border-secondary/20 rounded-2xl p-6 shadow-md relative overflow-hidden text-left space-y-4 group card-interactive">
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <IslamicPattern variant="star" opacity={1} />
            </div>
            <OrnamentalCorner position="top-left" size="sm" className="text-secondary/20" />
            <span className="inline-block px-2.5 py-0.5 bg-secondary text-primary font-bold text-[9px] rounded-md uppercase tracking-wider">
              PSB TA 2026/2027
            </span>
            <h4 className="font-display font-bold text-base text-secondary leading-snug">
              Ingin Menjadi Santri Penghafal Al-Qur'an?
            </h4>
            <p className="text-bg-base/70 text-xs leading-relaxed">
              Pendaftaran Santri Baru Pondok Pesantren Tahfidhul Qur'an Ma'unah Sari Kediri telah dibuka untuk putra & putri.
            </p>
            <button
              onClick={() => onNavigate('pendaftaran')}
              className="btn-primary focus-ring text-xs w-full justify-center py-2.5 font-bold"
            >
              Daftar Sekarang
            </button>
          </div>
        </aside>
      </div>

      {/* 4. Back Actions Bottom */}
      <div className="flex flex-wrap gap-4 justify-center pt-6">
        <button
          onClick={() => onNavigate('artikel')}
          className="btn-secondary focus-ring flex items-center gap-2 font-bold px-5 py-2.5 text-xs sm:text-sm"
        >
          <ArrowLeft className="icon-xs" />
          Daftar Artikel
        </button>
        <button
          onClick={() => onNavigate('beranda')}
          className="px-5 py-2.5 border border-primary/20 text-primary hover:border-secondary hover:text-secondary font-bold rounded-lg transition-standard flex items-center gap-1.5 focus:outline-none focus-ring text-xs sm:text-sm"
        >
          Beranda Utama
        </button>
      </div>
    </div>
  );
}
