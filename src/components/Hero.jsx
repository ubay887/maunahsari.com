import React from 'react';
import { ArrowRight, ChevronRight, BookOpen } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <section className="relative overflow-hidden bg-primary text-bg-surface pt-28 pb-16 lg:pt-36 lg:pb-24 border-b-4 border-secondary shadow-lg">
      {/* Decorative BG Grid & Circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#092c1b_1px,transparent_1px),linear-gradient(to_bottom,#092c1b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="container-custom relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading copy & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-surface/10 rounded-full border border-bg-surface/20 text-xs font-semibold tracking-wider text-secondary uppercase animate-pulse">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span>Penerimaan Santri Baru 2026/2027</span>
          </div>

          <div className="space-y-2">
            <span className="block text-xs md:text-sm font-semibold tracking-widest text-secondary uppercase leading-none">
              Selamat Datang di Portal Resmi
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-bg-surface leading-tight">
              Pesantren Tahfidhul Qur'an <br />
              <span className="text-secondary italic">Ma'unah Sari</span>
            </h1>
          </div>

          <p className="text-bg-base/80 text-sm md:text-base max-w-xl leading-relaxed">
            Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PPTQ Ma'unah Sari, Bandar Kidul, Kota Kediri.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('pendaftaran')}
              className="px-6 py-3 glossy-gold text-primary font-bold rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-2 group focus:outline-none"
            >
              Daftar Santri Baru
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('profil')}
              className="px-6 py-3 border border-bg-surface/30 hover:border-secondary hover:bg-bg-surface/5 text-bg-surface hover:text-secondary font-semibold rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-1.5 focus:outline-none"
            >
              Pelajari Profil Kami
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Decorative Visual Callout Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm glass-panel rounded-2xl p-6 space-y-6">
            {/* Top gold geometric tag */}
            <div className="absolute -top-3 left-6 px-3 py-1 glossy-gold text-primary font-bold text-xs rounded-full uppercase tracking-wider">
              Sarat Barokah
            </div>

            {/* Content Info */}
            <div className="space-y-4 pt-2 text-left">
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
              <blockquote className="text-bg-base/90 italic text-sm leading-relaxed">
                "Ngaji itu harus dengan sungguh-sungguh, kalau sudah selesai mengaji harus dijaga dengan sungguh-sungguh, tetap harus dideres (diulang), sisihkan waktu untuk muroja'ah."
              </blockquote>
              <div className="border-t border-bg-surface/10 pt-3">
                <span className="block text-xs font-bold text-secondary tracking-wide uppercase">
                  KH. R. Abdul Hamid Abdul Qodir
                </span>
                <span className="block text-[10px] text-bg-base/60 uppercase">
                  Pengasuh PPTQ Ma'unah Sari
                </span>
              </div>
            </div>

            {/* Bottom highlights stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-bg-surface/10 pt-4 text-center">
              <div>
                <span className="block text-2xl font-bold font-display text-secondary">1967 M</span>
                <span className="block text-[10px] text-bg-base/60 uppercase tracking-wider">Berdiri Sejak</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-display text-secondary">RMI NU</span>
                <span className="block text-[10px] text-bg-base/60 uppercase tracking-wider">Afiliasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
