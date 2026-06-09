import React, { useState } from 'react';
import { Clock, BookOpen, Sun, Moon } from 'lucide-react';

const scheduleItems = [
  {
    id: 'subuh',
    time: '04:30 - 06:00',
    title: 'Setoran Pagi',
    icon: Sun,
    desc: 'Kegiatan setoran hafalan baru atau muroja\'ah kepada Pengasuh atau Ustadz/Ustadzah setelah shalat Subuh.',
    details: 'Waktu utama di mana pikiran santri masih segar untuk menyetorkan hafalan Al-Qur\'an terbaiknya.'
  },
  {
    id: 'deresan',
    time: '14:30 - 15:30',
    title: 'Deresan Siang',
    icon: Clock,
    desc: 'Mempersiapkan hafalan (muroja\'ah mandiri) secara individu maupun berkelompok sebelum setoran berikutnya.',
    details: 'Santri saling menyimak bacaan satu sama lain guna memperkuat ketepatan tajwid dan kelancaran.'
  },
  {
    id: 'diniyyah',
    time: '20:00 - 21:00',
    title: 'Madrasah Diniyyah',
    icon: BookOpen,
    desc: 'Pembelajaran kitab kuning dan penjenjangan pemahaman aksara Pegon (Kelas I & Kelas II/IV).',
    details: 'Mendalami hukum fiqih, tafsir, dan tata bahasa Arab guna menyeimbangkan hafalan dengan pemahaman syariat.'
  },
  {
    id: 'malam',
    time: '21:30 - Selesai',
    title: 'Deresan Malam',
    icon: Moon,
    desc: 'Muroja\'ah lanjutan sebelum istirahat malam, dikhususkan untuk memantapkan hafalan yang telah disetorkan.',
    details: 'Dilakukan dengan khidmat guna menanamkan ayat-ayat suci Al-Qur\'an ke dalam memori jangka panjang.'
  }
];

export default function DailyCompass() {
  const [activeId, setActiveId] = useState('subuh');
  const activeItem = scheduleItems.find(item => item.id === activeId);

  return (
    <div className="bg-bg-elevated border border-primary/5 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
      {/* Background Islamic Watermark Pattern */}
      <div className="absolute inset-0 opacity-3 pointer-events-none flex items-center justify-center">
        <div className="w-96 h-96 rounded-full border-4 border-dashed border-secondary/20 animate-spin-slow"></div>
      </div>

      <div className="text-center mb-8 relative z-10">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase">
          Signature Experience
        </span>
        <h2 className="text-display-md text-primary mt-1">
          Kompas Rutinitas Santri
        </h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mt-2">
          Garis waktu interaktif yang menggambarkan ritme disiplin harian seorang penghafal Al-Qur'an di Ma'unah Sari.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Visual Dial (Left side) */}
        <div className="flex justify-center">
          <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-secondary/25 flex items-center justify-center">
            {/* Inner Ring */}
            <div className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full border border-primary/10 flex items-center justify-center bg-bg-surface shadow-inner">
              {/* Display inside Dial */}
              <div className="text-center p-4">
                <activeItem.icon className="w-8 h-8 md:w-10 md:h-10 mx-auto text-secondary animate-float" />
                <span className="block text-xs text-text-muted font-mono tracking-wider mt-2">
                  {activeItem.time}
                </span>
                <span className="block font-display font-bold text-primary text-base md:text-lg mt-1">
                  {activeItem.title}
                </span>
              </div>
            </div>

            {/* Orbiting Buttons */}
            {scheduleItems.map((item, idx) => {
              const angle = (idx * 360) / scheduleItems.length;
              const radius = 112; // Radius of orbit
              const style = {
                transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`
              };
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  style={style}
                  className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-md border transition-standard focus:outline-none focus-ring ${
                    activeId === item.id
                      ? 'bg-primary border-secondary text-secondary scale-110 ring-4 ring-secondary/20'
                      : 'bg-bg-surface border-primary/10 text-primary hover:border-secondary hover:text-secondary'
                  }`}
                  aria-label={`Lihat kegiatan ${item.title}`}
                >
                  <Icon className="icon-sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Display Panel (Right side) */}
        <div className="flex flex-col justify-center bg-bg-surface/50 border border-primary/5 rounded-xl p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-primary/10 pb-4 mb-4">
            <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
              <Clock className="icon-sm" />
            </div>
            <div>
              <span className="text-xs text-secondary font-mono font-bold uppercase tracking-wider block">
                Alokasi Waktu
              </span>
              <span className="text-sm font-semibold text-text-muted block">
                {activeItem.time} WIB
              </span>
            </div>
          </div>

          <h3 className="text-heading-lg text-primary mb-2">
            {activeItem.title}
          </h3>
          <p className="text-text-muted text-sm leading-relaxed mb-4">
            {activeItem.desc}
          </p>

          <div className="bg-primary/5 border-l-4 border-secondary p-3 rounded-r-lg">
            <span className="text-xs text-primary font-bold block mb-1">Filosofi & Detail</span>
            <p className="text-xs text-text-muted leading-relaxed">
              {activeItem.details}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
