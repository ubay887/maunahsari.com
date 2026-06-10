import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Beranda from './components/Beranda';
import Profil from './components/Profil';
import Pendaftaran from './components/Pendaftaran';
import PondokPutra from './components/PondokPutra';
import PondokPutri from './components/PondokPutri';
import Narahubung from './components/Narahubung';
import Alumni from './components/Alumni';
import ArtikelList from './components/ArtikelList';
import ArtikelDetail from './components/ArtikelDetail';
import { articles } from './data/articles';

export default function App() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (!path) return 'beranda';
    if (path === 'pendaftaran-santri-baru-20262027') return 'pendaftaran';
    if (path === 'artikel') return 'artikel';
    if (path.startsWith('artikel/')) return 'artikel-detail';
    return path;
  };

  const getArticleSlugFromPath = () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (path.startsWith('artikel/')) {
      return path.substring('artikel/'.length);
    }
    return null;
  };

  const [activePage, setActivePageState] = useState(getPageFromPath);
  const [activeArticleSlug, setActiveArticleSlug] = useState(getArticleSlugFromPath);

  const setActivePage = (pageId, articleSlug = null) => {
    let path = `/${pageId}`;
    if (pageId === 'beranda') path = '/';
    if (pageId === 'artikel-detail' && articleSlug) path = `/artikel/${articleSlug}`;
    window.history.pushState({}, '', path);
    setActivePageState(pageId);
    setActiveArticleSlug(articleSlug);
  };

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActivePageState(getPageFromPath());
      setActiveArticleSlug(getArticleSlugFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Title and Meta Description Update
  useEffect(() => {
    let title = "PTQ Ma'unah Sari Kediri - Portal Resmi Pesantren";
    let desc = "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PTQ Ma'unah Sari, Kediri.";
    
    switch (activePage) {
      case 'beranda':
        title = "PTQ Ma'unah Sari Kediri - Portal Resmi Pesantren";
        desc = "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PTQ Ma'unah Sari, Kediri.";
        break;
      case 'profil':
        title = "Profil Lengkap PTQ Ma'unah Sari Kediri - Sejarah & Kepengasuhan";
        desc = "Mengenal sejarah berdirinya PTQ Ma'unah Sari Kediri sejak 1967 M oleh KH. M. Mubassyir Mundzir dan riwayat kepengasuhan KH. R. Abdul Hamid Abdul Qodir.";
        break;
      case 'pendaftaran':
        title = "Pendaftaran Santri Baru (PSB) 2026/2027 - PTQ Ma'unah Sari";
        desc = "Informasi alur, syarat, berkas, rincian biaya administrasi, dan link pendaftaran online santri baru putra/putri PTQ Ma'unah Sari Kediri.";
        break;
      case 'putra':
        title = "Pondok Putra - Program Tahfidhul Qur'an PTQ Ma'unah Sari";
        desc = "Program pendidikan Al-Qur'an putra: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh 41 hari di PTQ Ma'unah Sari Kediri.";
        break;
      case 'putri':
        title = "Pondok Putri - Program Tahfidhul Qur'an PTQ Ma'unah Sari";
        desc = "Program pendidikan Al-Qur'an putri: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh Berkala di PTQ Ma'unah Sari Lil-Banat.";
        break;
      case 'narahubung':
        title = "Hubungi Kami - Narahubung Resmi & Media Sosial PTQ Ma'unah Sari";
        desc = "Layanan komunikasi resmi kantor putra/putri PTQ Ma'unah Sari Kediri. Kontak WhatsApp, Instagram, Facebook, YouTube, dan blog magalah santri.";
        break;
      case 'alumni':
        title = "Himpunan Alumni Ma'unah Sari (HAMAS) - PTQ Ma'unah Sari";
        desc = "Portal Himpunan Alumni Ma'unah Sari (HAMAS). Data sebaran alumni dan silaturahim alumni PTQ Ma'unah Sari Kediri.";
        break;
      case 'artikel':
        title = "Kabar & Catatan Santri - PTQ Ma'unah Sari Kediri";
        desc = "Membaca warta terbaru, artikel keislaman, sejarah, dan tips menghafal Al-Qur'an dari santri PTQ Ma'unah Sari Kediri.";
        break;
      case 'artikel-detail': {
        const article = articles.find(a => a.slug === activeArticleSlug);
        if (article) {
          title = `${article.title} - PTQ Ma'unah Sari`;
          desc = article.excerpt;
        } else {
          title = "Baca Artikel - PTQ Ma'unah Sari Kediri";
          desc = "Membaca kabar dan tulisan ilmiah dari santri PTQ Ma'unah Sari Kediri.";
        }
        break;
      }
    }
    
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [activePage, activeArticleSlug]);

  // Simple page router rendering matching page content
  const renderPageContent = () => {
    switch (activePage) {
      case 'beranda':
        return <Beranda onNavigate={setActivePage} />;
      case 'profil':
        return <Profil />;
      case 'pendaftaran':
        return <Pendaftaran />;
      case 'putra':
        return <PondokPutra />;
      case 'putri':
        return <PondokPutri />;
      case 'narahubung':
        return <Narahubung />;
      case 'alumni':
        return <Alumni />;
      case 'artikel':
        return <ArtikelList onNavigate={setActivePage} />;
      case 'artikel-detail':
        return <ArtikelDetail articleSlug={activeArticleSlug} onNavigate={setActivePage} />;
      default:
        return <Beranda onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-body antialiased">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-secondary focus:text-primary focus:p-3 focus:rounded-lg focus:font-bold focus:z-50 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Shared Header Navigation */}
      <Header activePage={activePage} setActivePage={setActivePage} />

      {/* Conditionally Render Hero only on Beranda */}
      {activePage === 'beranda' && <Hero onNavigate={setActivePage} />}

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow">
        {renderPageContent()}
      </main>

      {/* Shared Footer Area */}
      <Footer onNavigate={setActivePage} />
    </div>
  );
}
