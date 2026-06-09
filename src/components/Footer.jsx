import React from 'react';
import { BookOpen, MapPin, Phone, MessageCircle, Heart } from 'lucide-react';
import sealLogo from '../assets/seal_logo.png';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  const handleNav = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-bg-surface border-t-4 border-secondary shadow-inner mt-auto">
      {/* Upper Grid Area */}
      <div className="container-custom py-12 grid gap-8 md:grid-cols-12">
        {/* Info Column */}
        <div className="md:col-span-5 text-left space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={sealLogo}
              alt="Logo Arab PTQ Ma'unah Sari"
              className="w-16 h-16 object-contain rounded-full bg-bg-surface p-1 shadow-md border border-secondary/20"
            />
            <div>
              <span className="block font-display text-lg font-bold text-bg-surface tracking-wider leading-none">
                PTQ Ma'unah Sari
              </span>
              <span className="block text-[10px] text-secondary font-semibold uppercase tracking-wider mt-1.5">
                Pesantren Tahfidhul Qur'an
              </span>
            </div>
          </div>
          <p className="text-xs text-bg-base/70 max-w-sm leading-relaxed">
            Lembaga pendidikan Tahfidhul Qur'an berafiliasi dengan Rabithah Ma'had Al-Islamiyyah (RMI) Nahdlatul Ulama yang mendidik santri putra-putri berwawasan Ahlussunnah wal Jama'ah An-Nahdliyyah.
          </p>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 text-left space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Akses Cepat</h4>
          <ul className="text-xs space-y-2">
            <li>
              <button onClick={() => handleNav('beranda')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Beranda
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('profil')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Profil Pesantren
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('pendaftaran')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pendaftaran (PSB)
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('putra')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pondok Putra
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('putri')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Pondok Putri
              </button>
            </li>
            <li>
              <button onClick={() => handleNav('alumni')} className="hover:text-secondary hover:underline transition-standard focus:outline-none focus-ring">
                Alumni (HAMAS)
              </button>
            </li>
          </ul>
        </div>

        {/* Contact/Address Column */}
        <div className="md:col-span-4 text-left space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Sekretariat</h4>
          <div className="text-xs text-bg-base/70 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="icon-xs text-secondary shrink-0 mt-0.5" />
              <span>
                Jl. KH. Agus Salim No.8, Bandar Kidul, Kec. Mojoroto, Kota Kediri, Jawa Timur 64118
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="icon-xs text-secondary shrink-0" />
              <span>0812-4530-6020 (Putra)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="icon-xs text-secondary shrink-0" />
              <span>0856-4571-7767 (Putri)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social / Copyright Area */}
      <div className="bg-[#092c1b] py-6 border-t border-bg-surface/10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-bg-base/50">
            &copy; {currentYear} PTQ Ma'unah Sari. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1 text-bg-base/40">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> untuk Para Huffadh Al-Qur'an
          </div>
        </div>
      </div>
    </footer>
  );
}
