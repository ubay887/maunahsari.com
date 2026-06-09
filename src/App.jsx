import React, { useState, useEffect } from 'react';
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

export default function App() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (!path) return 'beranda';
    if (path === 'pendaftaran-santri-baru-20262027') return 'pendaftaran';
    return path;
  };

  const [activePage, setActivePageState] = useState(getPageFromPath);

  const setActivePage = (pageId) => {
    let path = `/${pageId}`;
    if (pageId === 'beranda') path = '/';
    window.history.pushState({}, '', path);
    setActivePageState(pageId);
  };

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActivePageState(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Title and Meta Description Update
  useEffect(() => {
    let title = "PPTQ Ma'unah Sari Kediri - Portal Resmi Pesantren";
    let desc = "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PPTQ Ma'unah Sari, Kediri.";
    
    switch (activePage) {
      case 'beranda':
        title = "PPTQ Ma'unah Sari Kediri - Portal Resmi Pesantren";
        desc = "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PPTQ Ma'unah Sari, Kediri.";
        break;
      case 'profil':
        title = "Profil Lengkap PPTQ Ma'unah Sari Kediri - Sejarah & Kepengasuhan";
        desc = "Mengenal sejarah berdirinya PPTQ Ma'unah Sari Kediri sejak 1967 M oleh KH. M. Mubassyir Mundzir dan riwayat kepengasuhan KH. R. Abdul Hamid Abdul Qodir.";
        break;
      case 'pendaftaran':
        title = "Pendaftaran Santri Baru (PSB) 2026/2027 - PPTQ Ma'unah Sari";
        desc = "Informasi alur, syarat, berkas, rincian biaya administrasi, dan link pendaftaran online santri baru putra/putri PPTQ Ma'unah Sari Kediri.";
        break;
      case 'putra':
        title = "Pondok Putra - Program Tahfidhul Qur'an PPTQ Ma'unah Sari";
        desc = "Program pendidikan Al-Qur'an putra: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh 41 hari di PPTQ Ma'unah Sari Kediri.";
        break;
      case 'putri':
        title = "Pondok Putri - Program Tahfidhul Qur'an PPTQ Ma'unah Sari";
        desc = "Program pendidikan Al-Qur'an putri: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh Berkala di PPTQ Ma'unah Sari Lil-Banat.";
        break;
      case 'narahubung':
        title = "Hubungi Kami - Narahubung Resmi & Media Sosial PPTQ Ma'unah Sari";
        desc = "Layanan komunikasi resmi kantor putra/putri PPTQ Ma'unah Sari Kediri. Kontak WhatsApp, Instagram, Facebook, YouTube, dan blog majalah santri.";
        break;
      case 'alumni':
        title = "Himpunan Alumni Ma'unah Sari (HAMAS) - PPTQ Ma'unah Sari";
        desc = "Portal Himpunan Alumni Ma'unah Sari (HAMAS). Data sebaran alumni dan silaturahim alumni PPTQ Ma'unah Sari Kediri.";
        break;
    }
    
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [activePage]);

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
