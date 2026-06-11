import { useState } from 'react';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import LogIn from 'lucide-react/dist/esm/icons/log-in';
import { useNavigation } from '@/contexts/NavigationContext';
import logoImg from '@/assets/images/logos/seal_logo.png';

export default function Header() {
  const { activePage, navigate } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobilePondokOpen, setIsMobilePondokOpen] = useState(false);

  const mainLinks = [
    { name: 'Beranda', id: 'beranda' },
    { name: 'Profil', id: 'profil' },
  ];

  const extraLinks = [
    { name: 'Alumni', id: 'alumni' },
    { name: 'Artikel', id: 'artikel' },
    { name: 'Narahubung', id: 'narahubung' },
  ];

  const handleNavClick = (id) => {
    navigate(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = activePage === 'beranda';
  const isPondokActive = activePage === 'putra' || activePage === 'putri';

  return (
    <header
      className={`transition-all duration-300 z-50 ${
        isHome
          ? 'absolute top-0 left-0 w-full bg-gradient-to-b from-primary/40 to-transparent'
          : 'sticky top-0 bg-card/80 backdrop-blur-md border-b border-primary/5 shadow-md'
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
            alt="Logo PTQ Ma'unah Sari"
            className="w-10 h-10 object-contain rounded-full border border-primary/10 bg-background p-0.5 group-hover:scale-105 transition-transform duration-300 shadow-sm"
          />
          <div className="text-left">
            <span
              className={`block font-display text-lg font-bold tracking-wide leading-none transition-colors ${
                isHome ? 'text-white' : 'text-primary'
              }`}
            >
              PTQ Ma'unah Sari
            </span>
            <span className="hidden sm:block text-[9px] font-bold text-secondary tracking-wider uppercase mt-1">
              Bandar Kidul - Mojoroto - Kota Kediri
            </span>
            <span className="block sm:hidden text-[9px] font-bold text-secondary tracking-wider uppercase mt-1">
              Kediri
            </span>
          </div>
        </button>

        {/* Desktop Navigation & CTA */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6" aria-label="Menu Utama">
            {/* Main Links before Pondok */}
            {mainLinks.map((item) => (
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
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.name}
                {activePage === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            ))}

            {/* Pondok Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1 py-2 px-1 text-sm font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                  isPondokActive
                    ? isHome
                      ? 'text-white'
                      : 'text-primary'
                    : isHome
                    ? 'text-white/70 hover:text-white'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                aria-expanded={isPondokActive}
              >
                <span>Pondok</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                {isPondokActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />
                )}
              </button>

              {/* Dropdown panel */}
              <div className="absolute top-full left-0 mt-1 w-44 rounded-lg bg-card border border-primary/10 shadow-lg py-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 focus-within:opacity-100 focus-within:visible focus-within:translate-y-0 transition-all duration-200 z-50">
                <button
                  onClick={() => handleNavClick('putra')}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold tracking-wide transition-colors hover:bg-primary/5 hover:text-primary ${
                    activePage === 'putra' ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                  }`}
                >
                  Pondok Putra
                </button>
                <button
                  onClick={() => handleNavClick('putri')}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold tracking-wide transition-colors hover:bg-primary/5 hover:text-primary ${
                    activePage === 'putri' ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                  }`}
                >
                  Pondok Putri
                </button>
              </div>
            </div>

            {/* Extra Links after Pondok */}
            {extraLinks.map((item) => (
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
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.name}
                {activePage === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Golden CTA Button */}
          <button
            onClick={() => handleNavClick('pendaftaran')}
            className="btn-primary text-xs !py-2 !px-4 hover:scale-105 active:scale-95 duration-200 transition-all focus:outline-none focus-ring"
          >
            Pendaftaran (PSB)
          </button>

          {/* Login CTA Button */}
          <button
            onClick={() => handleNavClick('login')}
            className={`text-xs !py-2 !px-4 hover:scale-105 active:scale-95 duration-200 transition-all focus:outline-none focus-ring flex items-center gap-1.5 font-bold rounded-lg border cursor-pointer ${
              isHome 
                ? 'border-white/20 text-white hover:bg-white/10 bg-white/5' 
                : 'border-primary/20 text-primary hover:bg-primary/5 bg-transparent'
            }`}
          >
            <span>Masuk Portal</span>
            <LogIn className="icon-xs" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-lg transition-standard focus:outline-none focus-ring ${
            isHome ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-primary'
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
            isHome ? 'bg-primary/98 border-white/10' : 'bg-card border-primary/10'
          }`}
        >
          <nav className="flex flex-col p-4 gap-2" aria-label="Menu Mobile">
            {/* Main Links */}
            {mainLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                  activePage === item.id
                    ? isHome
                      ? 'bg-white/10 text-white border-l-4 border-secondary'
                      : 'bg-primary/5 text-primary border-l-4 border-secondary'
                    : isHome
                    ? 'text-white/80 hover:bg-white/5 hover:text-white'
                    : 'text-muted-foreground hover:bg-background hover:text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* Pondok Mobile Accordion */}
            <div>
              <button
                onClick={() => setIsMobilePondokOpen(!isMobilePondokOpen)}
                className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                  isPondokActive
                    ? isHome
                      ? 'bg-white/10 text-white border-l-4 border-secondary'
                      : 'bg-primary/5 text-primary border-l-4 border-secondary'
                    : isHome
                    ? 'text-white/80 hover:bg-white/5 hover:text-white'
                    : 'text-muted-foreground hover:bg-background hover:text-primary'
                }`}
              >
                <span>Pondok</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMobilePondokOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isMobilePondokOpen && (
                <div className="pl-4 mt-1 flex flex-col gap-1 border-l border-primary/10 ml-6 animate-fade-in">
                  <button
                    onClick={() => handleNavClick('putra')}
                    className={`w-full text-left py-2 px-3 rounded-md text-sm font-semibold transition-standard focus:outline-none focus-ring ${
                      activePage === 'putra'
                        ? isHome
                          ? 'text-white font-bold'
                          : 'text-primary font-bold'
                        : isHome
                        ? 'text-white/70 hover:text-white'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Pondok Putra
                  </button>
                  <button
                    onClick={() => handleNavClick('putri')}
                    className={`w-full text-left py-2 px-3 rounded-md text-sm font-semibold transition-standard focus:outline-none focus-ring ${
                      activePage === 'putri'
                        ? isHome
                          ? 'text-white font-bold'
                          : 'text-primary font-bold'
                        : isHome
                        ? 'text-white/70 hover:text-white'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Pondok Putri
                  </button>
                </div>
              )}
            </div>

            {/* Extra Links */}
            {extraLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-2.5 px-4 rounded-lg font-semibold tracking-wide transition-standard focus:outline-none focus-ring ${
                  activePage === item.id
                    ? isHome
                      ? 'bg-white/10 text-white border-l-4 border-secondary'
                      : 'bg-primary/5 text-primary border-l-4 border-secondary'
                    : isHome
                    ? 'text-white/80 hover:bg-white/5 hover:text-white'
                    : 'text-muted-foreground hover:bg-background hover:text-primary'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* Registration & Login CTA Buttons at the bottom of Mobile Drawer */}
            <div className="mt-4 pt-4 border-t border-primary/10 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('pendaftaran')}
                className="w-full btn-primary justify-center text-sm py-3 px-4 shadow-md focus:outline-none focus-ring"
              >
                Pendaftaran (PSB)
              </button>
              <button
                onClick={() => handleNavClick('login')}
                className={`w-full flex items-center justify-center gap-1.5 text-sm py-3 px-4 font-bold rounded-lg border cursor-pointer focus:outline-none focus-ring ${
                  isHome 
                    ? 'border-white/20 text-white hover:bg-white/10 bg-white/5' 
                    : 'border-primary/20 text-primary hover:bg-primary/5 bg-transparent'
                }`}
              >
                <span>Masuk Portal</span>
                <LogIn className="icon-xs" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

