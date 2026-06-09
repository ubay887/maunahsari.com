import React, { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import logoImg from '../assets/seal_logo.png';

export default function Header({ activePage, setActivePage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Beranda', id: 'beranda' },
    { name: 'Profil', id: 'profil' },
    { name: 'Pendaftaran (PSB)', id: 'pendaftaran' },
    { name: 'Pondok Putra', id: 'putra' },
    { name: 'Pondok Putri', id: 'putri' },
    { name: 'Alumni', id: 'alumni' },
    { name: 'Narahubung', id: 'narahubung' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activePage === 'beranda';

  return (
    <header
      className={`transition-all duration-300 z-50 ${
        isHome
          ? 'absolute top-0 left-0 w-full bg-gradient-to-b from-primary/40 to-transparent'
          : 'sticky top-0 bg-bg-surface/80 backdrop-blur-md border-b border-primary/5 shadow-md'
      }`}
    >
      <div className="container-custom py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2 group focus:outline-none focus-ring transition-standard"
          aria-label="Kembali ke Beranda"
        >
          <img
            src={logoImg}
            alt="Logo PPTQ Ma'unah Sari"
            className="w-10 h-10 object-contain rounded-full border border-primary/10 bg-bg-base p-0.5 group-hover:scale-105 transition-transform duration-300 shadow-sm"
          />
          <div className="text-left">
            <span
              className={`block font-display text-lg font-bold tracking-wide leading-none transition-colors ${
                isHome ? 'text-white' : 'text-primary'
              }`}
            >
              PPTQ Ma'unah Sari
            </span>
            <span className="hidden sm:block text-[9px] font-bold text-secondary tracking-wider uppercase mt-1">
              Bandar Kidul - Mojoroto - Kota Kediri
            </span>
            <span className="block sm:hidden text-[9px] font-bold text-secondary tracking-wider uppercase mt-1">
              Kediri
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Menu Utama">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative py-2 px-1 text-sm font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                activePage === item.id
                  ? isHome
                    ? 'text-white'
                    : 'text-primary'
                  : isHome
                  ? 'text-white/70 hover:text-white'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              {item.name}
              {activePage === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-lg transition-standard focus:outline-none focus-ring ${
            isHome ? 'text-white/80 hover:text-white' : 'text-text-muted hover:text-primary'
          }`}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="icon-md" /> : <Menu className="icon-md" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          className={`md:hidden border-b transition-all duration-300 ${
            isHome ? 'bg-primary/95 border-white/10' : 'bg-bg-surface border-primary/10'
          }`}
        >
          <nav className="flex flex-col p-4 gap-2" aria-label="Menu Mobile">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-3 px-4 rounded-lg font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                  activePage === item.id
                    ? isHome
                      ? 'bg-white/10 text-white border-l-4 border-secondary'
                      : 'bg-primary/5 text-primary border-l-4 border-secondary'
                    : isHome
                    ? 'text-white/80 hover:bg-white/5 hover:text-white'
                    : 'text-text-muted hover:bg-bg-base hover:text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
