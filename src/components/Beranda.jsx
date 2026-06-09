import React from 'react';
import { ChevronRight, ArrowRight, BookOpen, Quote, ShieldCheck, Heart } from 'lucide-react';
import DailyCompass from './DailyCompass';

// Local Assets
import gusHamidImg from '../assets/gus_hamid.png';
import agusKhalafImg from '../assets/agus_khalaf.png';
import profilCoverImg from '../assets/profil_cover.png';
import putraCoverImg from '../assets/putra_cover.png';
import putriCoverImg from '../assets/putri_cover.png';

export default function Beranda({ onNavigate }) {
  return (
    <div className="space-y-12 py-8 md:py-12">
      {/* Welcome Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto px-4">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Laman Informasi Resmi
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Menjaga Tradisi Qur'ani & Tashawwuf
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      {/* Info Terbaru: Pendaftaran Santri Baru 2026/2027 */}
      <div className="container-custom">
        <div className="bg-bg-surface border border-primary/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-primary/5 p-4 rounded-xl text-primary shrink-0">
            <BookOpen className="icon-lg text-secondary" />
          </div>
          <div className="text-left space-y-2 flex-grow">
            <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase tracking-wider">
              INFO TERBARU
            </span>
            <h3 className="text-display-md text-primary">
              Pendaftaran Santri Baru Tahun Ajaran 2026/2027
            </h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-3xl">
              Pesantren Tahfidhul Qur'an Ma'unah Sari membuka pendaftaran Santri Baru Tahun Ajaran 2026/2027 bagi santri putra dan putri. Pendaftaran dapat dilakukan secara daring (online) maupun luring (offline) hingga kuota terpenuhi.
            </p>
          </div>
          <button
            onClick={() => onNavigate('pendaftaran')}
            className="btn-primary focus-ring shrink-0"
          >
            Selengkapnya
            <ArrowRight className="icon-xs" />
          </button>
        </div>
      </div>

      {/* Interactive Compass Component (Signature Element) */}
      <div className="container-custom">
        <DailyCompass />
      </div>

      {/* Spiritual Quotes Grid */}
      <div className="bg-primary/5 py-12 border-y border-primary/5">
        <div className="container-custom">
          <h3 className="text-display-md text-primary mb-8 text-center">
            Pesan dan Kalam Mutiara Masyayikh
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quote 1 */}
            <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm text-left relative space-y-4 flex flex-col justify-between">
              <Quote className="icon-lg text-secondary/30 absolute top-4 right-4" />
              <blockquote className="text-text-muted text-sm italic leading-relaxed pt-2">
                "Ngaji itu harus dengan sungguh-sungguh. Kalau sudah selesai mengaji, harus dirawat dengan sungguh-sungguh (kudu diopeni sing tenanan), tetap harus dideres (diulang), sisihkan waktu untuk muroja'ah."
              </blockquote>
              <div className="border-t border-primary/10 pt-3 flex items-center gap-3">
                <img
                  src={gusHamidImg}
                  alt="KH. R. Abdul Hamid Abdul Qodir"
                  className="w-10 h-10 rounded-full object-cover border border-secondary"
                />
                <div>
                  <span className="block text-sm font-bold text-primary">KH. R. Abdul Hamid Abdul Qodir</span>
                  <span className="block text-[11px] text-text-muted uppercase tracking-wider">Pengasuh PPTQ Ma'unah Sari</span>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm text-left relative space-y-4 flex flex-col justify-between">
              <Quote className="icon-lg text-secondary/30 absolute top-4 right-4" />
              <blockquote className="text-text-muted text-sm italic leading-relaxed pt-2">
                "Sebelum mulai menghafal Al-Qur'an, alangkah baiknya mengkhatamkan atau melancarkan bacaan bin-nadhor terlebih dahulu. Dahulukan yang fardhu 'ain sebelum fardhu kifayah."
              </blockquote>
              <div className="border-t border-primary/10 pt-3 flex items-center gap-3">
                <img
                  src={agusKhalafImg}
                  alt="Agus Khalaf Muhammad Abha"
                  className="w-10 h-10 rounded-full object-cover border border-secondary"
                />
                <div>
                  <span className="block text-sm font-bold text-primary">Agus Khalaf Muhammad Abha</span>
                  <span className="block text-[11px] text-text-muted uppercase tracking-wider">Keluarga Pengasuh / Dewan Pengajar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections Grid */}
      <div className="container-custom grid sm:grid-cols-3 gap-6">
        {[
          {
            title: 'Profil Pesantren',
            desc: 'Ketahui lebih lanjut mengenai sejarah berdirinya pesantren, profil pendiri (Simbah KH. Mubassyir Mundzir), pengasuh, dan letak geografis kami.',
            target: 'profil',
            image: profilCoverImg
          },
          {
            title: 'Pondok Putra',
            desc: 'Informasi khusus mengenai program tahfidh putra, jadwal harian, alur pendaftaran luring, fasilitas kotak almari, dan narahubung putra.',
            target: 'putra',
            image: putraCoverImg
          },
          {
            title: 'Pondok Putri',
            desc: 'Informasi lengkap seputar program tahfidh putri, riyadhoh berkala 3 bulanan, jadwal setoran/deresan malam, dan narahubung putri.',
            target: 'putri',
            image: putriCoverImg
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-bg-surface border border-primary/5 hover:border-secondary rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-md transition-standard flex flex-col justify-between"
          >
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-display font-bold text-lg text-primary">{item.title}</h4>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
              <button
                onClick={() => onNavigate(item.target)}
                className="btn-tertiary mt-4 focus-ring"
              >
                Kunjungi Laman
                <ChevronRight className="icon-xs" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
