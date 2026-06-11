import Award from 'lucide-react/dist/esm/icons/award';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Clock from 'lucide-react/dist/esm/icons/clock';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

export default function PondokPutri() {
  const programs = [
    {
      title: 'Bil-Hifdhi',
      desc: 'Program menghafal Al-Qur\'an dengan sistem pengajian sorogan. Santri menyetorkan hafalan Al-Qur\'an langsung kepada Pengasuh atau Ustadzah untuk disimak dan ditashih.',
      target: 'Membentuk hafalan santriwati yang mutqin (kuat), benar, dan sesuai kaidah tajwid.'
    },
    {
      title: 'Bin-Nadhor',
      desc: 'Pembelajaran membaca Al-Qur\'an secara bin-nadhor (melihat mushaf) dengan sistem sorogan di hadapan Pengasuh atau Ustadzah guna membenarkan makhraj dan kelancaran.',
      target: 'Fashahah dan kelancaran bacaan sebelum memulai hafalan baru.'
    },
    {
      title: 'Qira\'ah Sab\'ah',
      desc: 'Kajian perbandingan riwayat bacaan Al-Qur\'an dari tujuh imam qira\'at utama, dikhususkan untuk santriwati yang telah mengkhatamkan setoran hafalan Al-Qur\'an 30 juz.',
      target: 'Menguasai perbedaan bacaan mutawatir yang absah dari Rasulullah saw.'
    },
    {
      title: 'Riyadloh Berkala',
      desc: 'Tadribul ibadah mengkhatamkan Al-Qur\'an 30 juz satu kali sehari selama 41 hari. Dibuka secara berkala 3 bulan sekali dengan kuota maksimal 25 santriwati per gelombang.',
      target: 'Penerimaan berkala yang dapat disesuaikan dengan kuota asrama yang tersedia.'
    }
  ];

  const kegiatan = [
    { time: '06:00 & 10:00 WIB', title: 'Setoran Pagi & Siang', desc: 'Penyetoran hafalan baru atau muroja\'ah kepada mustami\'/ustadzah.' },
    { time: '20:00 - 21:00 WIB', title: 'Madrasah Diniyyah Ma\'unah Sari Lil-Banat', desc: 'Pendidikan kitab kuning berjenjang (Kelas I sampai Kelas IV).' },
    { time: '21:30 - Selesai WIB', title: 'Deresan Malam', desc: 'Mempersiapkan hafalan yang akan disetorkan keesokan harinya.' }
  ];

  return (
    <div className="py-8 md:py-12 px-4 max-w-5xl mx-auto space-y-12 text-left">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">
          Pendidikan Tahfidhul Qur'an Putri
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Pondok Putri
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
      </div>

      {/* Program Pendidikan */}
      <div className="space-y-6">
        <h3 className="text-display-md text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
          <BookOpen className="icon-md text-secondary" /> Program Pembelajaran
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((prog, idx) => (
            <div key={idx} className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-3">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase block">Program {idx + 1}</span>
              <h4 className="font-display font-bold text-lg text-primary">{prog.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">{prog.desc}</p>
              <div className="bg-primary/5 p-2.5 rounded-lg border-l-2 border-secondary text-[11px] text-muted-foreground">
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
          <h3 className="text-heading-lg text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
            <Clock className="icon-sm text-secondary" /> Kegiatan Harian
          </h3>
          <div className="space-y-4">
            {kegiatan.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-xs font-mono font-bold text-secondary bg-primary/5 px-2.5 py-1 rounded-md shrink-0 h-fit">
                  {item.time}
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-primary">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fasilitas & Ketentuan Kuota */}
        <div className="space-y-6">
          <h3 className="text-heading-lg text-primary border-b border-primary/10 pb-2 flex items-center gap-2">
            <Award className="icon-sm text-secondary" /> Fasilitas & Ketentuan
          </h3>
          <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary uppercase block">Fasilitas Utama Santriwati Mukim:</span>
              <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="icon-xs text-accent shrink-0" /> Kotak Almari Pribadi</li>
                <li className="flex items-center gap-2"><CheckCircle className="icon-xs text-accent shrink-0" /> Konsumsi Makan 2x Sehari</li>
              </ul>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg space-y-2">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <HelpCircle className="icon-xs shrink-0" /> Ketentuan Kuota:
              </span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Kuota pendaftaran santriwati baru ditetapkan berdasarkan jumlah kotak almari asrama putri yang tersedia. Sangat dianjurkan calon wali santriwati untuk berkoordinasi terlebih dahulu dengan narahubung putri sebelum menjadwalkan kunjungan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
