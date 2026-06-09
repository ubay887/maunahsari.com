import React from 'react';
import { Award, BookOpen, Clock, Heart, HelpCircle, CheckCircle } from 'lucide-react';

export default function PondokPutra() {
  const programs = [
    {
      title: 'Bil-Hifdhi',
      desc: 'Program khusus menghafal Al-Qur\'an dengan sistem pengajian sorogan. Santri menyetorkan hafalan Al-Qur\'an kepada Pengasuh atau Ustadz untuk disimak dan ditashih.',
      target: 'Membentuk hafalan santri yang kuat, benar, dan sesuai kaidah tajwid.'
    },
    {
      title: 'Bin-Nadhor',
      desc: 'Sistem pembelajaran sorogan membaca langsung dengan membawa mushaf Al-Qur\'an di hadapan Pengasuh atau Ustadz untuk ditashih kualitas bacaannya.',
      target: 'Fokus pada perbaikan, pemantapan, dan fashahah kualitas bacaan santri.'
    },
    {
      title: 'Qira\'ah Sab\'ah',
      desc: 'Program kajian perbandingan qira\'at dari tujuh imam (Qurra\' Sab\'ah), diperuntukkan khusus bagi santri putra yang telah menyelesaikan setoran hafalan 30 juz secara lancar.',
      target: 'Memperluas wawasan keilmuan riwayat bacaan Al-Qur\'an.'
    },
    {
      title: 'Riyadloh',
      desc: 'Program riyadloh spiritual mengkhatamkan Al-Qur\'an satu kali sehari selama 41 hari berturut-turut. Terbuka setiap saat dengan kuota sangat terbatas (maksimal 5 santri putra).',
      target: 'Mendekatkan diri secara batiniah pada keberkahan penjagaan kalamullah.'
    }
  ];

  const kegiatan = [
    { time: 'Setelah Subuh & Setelah Magrib', title: 'Setoran Hafalan', desc: 'Menyetorkan hafalan baru atau muroja\'ah kepada Pengasuh atau Ustadz.' },
    { time: '14:30 - 15:30 WIB', title: 'Deresan Siang', desc: 'Mempersiapkan hafalan yang akan disetorkan.' },
    { time: '20:00 - 21:00 WIB', title: 'Madrasah Diniyyah Al-Mundziriyyah', desc: 'Belajar menulis Pegon dan kajian kitab kuning (Kelas I & Kelas II).' }
  ];

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-12 text-left">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Pendidikan Tahfidhul Qur'an
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Pondok Putra
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      {/* Program Pendidikan */}
      <div className="space-y-6">
        <h3 className="font-display text-2xl font-bold text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-secondary" /> Program Pembelajaran
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((prog, idx) => (
            <div key={idx} className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm space-y-3">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase block">Program {idx + 1}</span>
              <h4 className="font-display font-bold text-lg text-primary">{prog.title}</h4>
              <p className="text-text-muted text-xs leading-relaxed">{prog.desc}</p>
              <div className="bg-primary/5 p-2.5 rounded-lg border-l-2 border-secondary text-[11px] text-text-muted">
                <strong>Target:</strong> {prog.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Kegiatan & Fasilitas */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Kegiatan Harian */}
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" /> Kegiatan Harian
          </h3>
          <div className="space-y-4">
            {kegiatan.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-xs font-mono font-bold text-secondary bg-primary/5 px-2.5 py-1 rounded-md shrink-0 h-fit">
                  {item.time}
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-primary">{item.title}</h4>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fasilitas & Ketentuan Kuota */}
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" /> Fasilitas & Ketentuan
          </h3>
          <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary uppercase block">Fasilitas Utama Santri Mukim:</span>
              <ul className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent shrink-0" /> Kotak Almari Pribadi</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-accent shrink-0" /> Konsumsi Makan 2x Sehari</li>
              </ul>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg space-y-2">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 shrink-0" /> Ketentuan Kuota:
              </span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Kuota pendaftaran santri baru ditetapkan secara ketat berdasarkan jumlah kotak almari mukim yang masih kosong. Dianjurkan calon wali santri untuk terlebih dahulu menghubungi narahubung pesantren guna memastikan kuota sebelum sowan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
