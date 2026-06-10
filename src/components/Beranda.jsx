import {
  ChevronRight,
  ArrowRight,
  BookOpen,
  Quote,
  ShieldCheck,
  Heart,
  Sparkles,
  School,
  BookOpenCheck,
  Award,
  Clock
} from 'lucide-react';
import DailyCompass from './DailyCompass';
import IslamicPattern, { SectionDivider, OrnamentalCorner } from './IslamicPattern';
import AnimatedCounter from './AnimatedCounter';
import { articles } from '../data/articles';

// Local Assets
import gusHamidImg from '../assets/gus_hamid.png';
import agusKhalafImg from '../assets/agus_khalaf.png';

export default function Beranda({ onNavigate }) {
  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* 1. Welcome Header (Menjaga Tradisi) */}
      <div className="text-center space-y-2 max-w-3xl mx-auto px-4 relative">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <IslamicPattern variant="arabesque" opacity={0.02} />
        </div>

        <span className="text-xs font-semibold text-secondary tracking-widest uppercase block animate-fade-in">
          Selamat Datang di Laman Informasi Resmi
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
          Menjaga Tradisi Qur'ani & Tashawwuf
        </h2>
        <div className="h-1 w-16 bg-secondary mx-auto rounded-full mt-3"></div>
      </div>

      {/* 2. Keunggulan & Karakter (USP Grid) */}
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* USP 1: Sanad Muttashil */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-standard card-interactive relative overflow-hidden group text-left">
            <OrnamentalCorner position="top-left" size="sm" className="text-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-bg-surface transition-standard">
              <ShieldCheck className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-display font-bold text-base text-primary mb-2">Sanad Al-Qur'an Muttashil</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Sanad tahfidh bersambung mulia melalui jalur Al-Muqri Al-Hafidz KH. R. Munawwir Krapyak Yogyakarta hingga Rasulullah SAW.
            </p>
          </div>

          {/* USP 2: Integrasi Tasawuf */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-standard card-interactive relative overflow-hidden group text-left">
            <OrnamentalCorner position="top-left" size="sm" className="text-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-bg-surface transition-standard">
              <Heart className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-display font-bold text-base text-primary mb-2">Integrasi Nilai Tasawuf</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Mengedepankan keluhuran akhlak, riyadhah spiritual, pembiasaan shalat berjamaah awal waktu, dan aurad zikir Masyayikh.
            </p>
          </div>

          {/* USP 3: Metode Sorogan */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-standard card-interactive relative overflow-hidden group text-left">
            <OrnamentalCorner position="top-left" size="sm" className="text-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-bg-surface transition-standard">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-display font-bold text-base text-primary mb-2">Metode Sorogan Klasik</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Bimbingan privat (one-on-one) setoran Al-Qur'an (bin-nadhor & bil-hifdhi) untuk akurasi tinggi makhraj dan tajwid santri.
            </p>
          </div>

          {/* USP 4: Lingkungan Qur'ani */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-standard card-interactive relative overflow-hidden group text-left">
            <OrnamentalCorner position="top-left" size="sm" className="text-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-bg-surface transition-standard">
              <School className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-display font-bold text-base text-primary mb-2">Lingkungan Qur'ani</h4>
            <p className="text-text-muted text-xs leading-relaxed">
              Suasana tenang dan religius khas kota Kediri di barat Sungai Brantas, sangat kondusif untuk fokus menghafal kalam ilahi.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Statistik Kemajuan Interaktif */}
      <div className="bg-primary text-bg-surface py-12 border-y-4 border-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <IslamicPattern variant="star" opacity={1} />
        </div>
        <div className="container-custom relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <span className="block text-4xl md:text-5xl font-bold font-display text-secondary">
              <AnimatedCounter end={1967} separator={false} />
            </span>
            <span className="block text-[11px] text-bg-base/70 uppercase font-semibold tracking-wider">Tahun Berdiri</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-4xl md:text-5xl font-bold font-display text-secondary">
              <AnimatedCounter end={3000} suffix="+" />
            </span>
            <span className="block text-[11px] text-bg-base/70 uppercase font-semibold tracking-wider">Alumni Tersebar</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-4xl md:text-5xl font-bold font-display text-secondary">
              <AnimatedCounter end={2} />
            </span>
            <span className="block text-[11px] text-bg-base/70 uppercase font-semibold tracking-wider">Kompleks (Putra & Putri)</span>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-4xl md:text-5xl font-bold font-display text-secondary">
              <AnimatedCounter end={100} suffix="%" />
            </span>
            <span className="block text-[11px] text-bg-base/70 uppercase font-semibold tracking-wider">Sanad Muttashil</span>
          </div>
        </div>
      </div>

      {/* 4. Program Pendidikan Utama */}
      <div className="container-custom space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">Kurikulum Khazanah</span>
          <h3 className="text-display-md text-primary font-bold">Program Pembelajaran</h3>
          <div className="h-0.5 w-12 bg-secondary/50 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Program 1: Bin-Nadhor */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-2xl p-6 md:p-8 shadow-sm flex gap-4 items-start card-interactive text-left">
            <div className="bg-secondary/15 p-3 rounded-xl text-primary shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-primary">Program Bin-Nadhor</h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Pembiasaan melafalkan Al-Qur'an secara tartil dengan melihat mushaf. Ditujukan untuk memantapkan hukum tajwid, makharijul huruf, dan waqaf ibtida' sebelum santri memulai program hafalan.
              </p>
            </div>
          </div>

          {/* Program 2: Bil-Hifdhi */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-2xl p-6 md:p-8 shadow-sm flex gap-4 items-start card-interactive text-left">
            <div className="bg-secondary/15 p-3 rounded-xl text-primary shrink-0">
              <BookOpenCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-primary">Program Bil-Hifdhi (Tahfidh)</h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Program menghafal Al-Qur'an 30 Juz secara mandiri dan terstruktur. Disetorkan secara sorogan satu-satu (privat) setiap subuh kepada pengasuh atau dewan ustadz/ustadzah untuk hasil ingatan yang kokoh.
              </p>
            </div>
          </div>

          {/* Program 3: Qira'ah Sab'ah */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-2xl p-6 md:p-8 shadow-sm flex gap-4 items-start card-interactive text-left">
            <div className="bg-secondary/15 p-3 rounded-xl text-primary shrink-0">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-primary">Qira'ah Sab'ah</h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Pendalaman ragam riwayat qira'ah dari tujuh imam besar yang mutawatir. Program prestisius tingkat lanjut bagi santri senior yang telah khatam bil-hifdhi 30 Juz serta lulus uji kelayakan.
              </p>
            </div>
          </div>

          {/* Program 4: Kajian Kitab & Diniyyah */}
          <div className="bg-bg-surface border border-primary/5 hover:border-secondary/20 rounded-2xl p-6 md:p-8 shadow-sm flex gap-4 items-start card-interactive text-left">
            <div className="bg-secondary/15 p-3 rounded-xl text-primary shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-primary">Madrasah Diniyyah & Kitab</h4>
              <p className="text-text-muted text-xs leading-relaxed">
                Integrasi materi fiqih ibadah praktis, adab, tauhid, akhlak tasawuf, dan kaidah Pegon. Santri diajarkan untuk menyeimbangkan keluhuran hafalan ayat Al-Qur'an dengan pemahaman syariat yang benar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Dinamika Harian (Daily Compass) */}
      <SectionDivider variant="ornamental" />
      <div className="container-custom">
        <DailyCompass />
      </div>
      <SectionDivider variant="ornamental" />

      {/* 6. Kalam Mutiara Masyayikh */}
      <div className="bg-primary/5 py-12 border-y border-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <IslamicPattern variant="geometric" opacity={0.03} />
        </div>

        <div className="container-custom relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">Nasihat & Petuah</span>
            <h3 className="text-display-md text-primary font-bold">Pesan & Kalam Mutiara Masyayikh</h3>
            <div className="h-0.5 w-12 bg-secondary/50 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quote 1 */}
            <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm text-left relative space-y-4 flex flex-col justify-between overflow-hidden">
              <OrnamentalCorner position="top-left" size="sm" className="text-secondary/25" />
              <OrnamentalCorner position="bottom-right" size="sm" className="text-secondary/25" />
              <Quote className="icon-lg text-secondary/30 absolute top-4 right-4 animate-float-gentle" />
              <blockquote className="text-text-muted text-sm italic leading-relaxed pt-2 z-10">
                "Ngaji itu harus dengan sungguh-sungguh. Kalau sudah selesai mengaji, harus dirawat dengan sungguh-sungguh (kudu diopeni sing tenanan), tetap harus dideres (diulang), sisihkan waktu untuk muroja'ah."
              </blockquote>
              <div className="border-t border-primary/10 pt-3 flex items-center gap-3 z-10">
                <img
                  src={gusHamidImg}
                  alt="KH. R. Abdul Hamid Abdul Qodir"
                  className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                />
                <div>
                  <span className="block text-sm font-bold text-primary">KH. R. Abdul Hamid Abdul Qodir</span>
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider">Pengasuh PTQ Ma'unah Sari</span>
                </div>
              </div>
            </div>

            {/* Quote 2 */}
            <div className="bg-bg-surface border border-primary/5 rounded-2xl p-6 md:p-8 shadow-sm text-left relative space-y-4 flex flex-col justify-between overflow-hidden">
              <OrnamentalCorner position="top-left" size="sm" className="text-secondary/25" />
              <OrnamentalCorner position="bottom-right" size="sm" className="text-secondary/25" />
              <Quote className="icon-lg text-secondary/30 absolute top-4 right-4 animate-float-gentle" />
              <blockquote className="text-text-muted text-sm italic leading-relaxed pt-2 z-10">
                "Sebelum mulai menghafal Al-Qur'an, alangkah baiknya mengkhatamkan atau melancarkan bacaan bin-nadhor terlebih dahulu. Dahulukan yang fardhu 'ain sebelum fardhu kifayah."
              </blockquote>
              <div className="border-t border-primary/10 pt-3 flex items-center gap-3 z-10">
                <img
                  src={agusKhalafImg}
                  alt="Agus Khalaf Muhammad Abha"
                  className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                />
                <div>
                  <span className="block text-sm font-bold text-primary">Agus Khalaf Muhammad Abha</span>
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider">Keluarga Pengasuh / Dewan Pengajar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Admission Center (PSB TA 2026/2027) */}
      <div className="container-custom">
        <div className="bg-bg-surface border-2 border-secondary/20 rounded-3xl p-6 md:p-10 shadow-md relative overflow-hidden text-left flex flex-col lg:flex-row gap-8 items-center card-interactive">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <IslamicPattern variant="geometric" opacity={1} />
          </div>
          <div className="space-y-5 flex-grow z-10">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 bg-primary text-secondary text-xs font-bold rounded-full uppercase tracking-wider">
                TA 2026/2027
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 block"></span>
                Pendaftaran Dibuka
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-display-md text-primary font-bold">
                Penerimaan Santri Baru (PSB) PTQ Ma'unah Sari
              </h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed max-w-2xl">
                Bergabunglah bersama keluarga besar penghafal Al-Qur'an. Kami menerima santri baru putra dan putri dengan opsi pendaftaran daring yang mudah maupun luring langsung di kantor pesantren.
              </p>
            </div>
            
            {/* Step steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-primary/10 pt-5">
              <div className="space-y-1">
                <span className="text-secondary font-mono font-bold text-base block">01.</span>
                <h5 className="font-bold text-xs text-primary">Daftar Daring/Luring</h5>
                <p className="text-text-muted text-[11px] leading-snug">Isi formulir pendaftaran melalui situs resmi atau datang langsung.</p>
              </div>
              <div className="space-y-1">
                <span className="text-secondary font-mono font-bold text-base block">02.</span>
                <h5 className="font-bold text-xs text-primary">Verifikasi Berkas</h5>
                <p className="text-text-muted text-[11px] leading-snug">Serahkan berkas administrasi dan ikuti tes penempatan kelas/bin-nadhor.</p>
              </div>
              <div className="space-y-1">
                <span className="text-secondary font-mono font-bold text-base block">03.</span>
                <h5 className="font-bold text-xs text-primary">Masuk Asrama</h5>
                <p className="text-text-muted text-[11px] leading-snug">Serah terima santri ke pihak pondok, pembagian asrama, dan orientasi.</p>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto z-10">
            <button
              onClick={() => onNavigate('pendaftaran')}
              className="btn-primary focus-ring text-center w-full justify-center text-sm font-bold"
            >
              Alur & Syarat Lengkap
              <ArrowRight className="icon-xs" />
            </button>
            <button
              onClick={() => onNavigate('narahubung')}
              className="btn-secondary focus-ring text-center w-full justify-center text-sm font-bold"
            >
              Hubungi Narahubung
            </button>
          </div>
        </div>
      </div>

      {/* 8. Preview Blog Unggulan (Horizontal Scroll) */}
      <div className="container-custom space-y-8">
        <div className="flex justify-between items-end border-b border-primary/10 pb-4">
          <div className="text-left space-y-1">
            <span className="text-xs font-semibold text-secondary tracking-widest uppercase block">Kabar & Catatan Santri</span>
            <h3 className="text-display-md text-primary font-bold">Warta & Artikel Pilihan</h3>
          </div>
          <button
            onClick={() => onNavigate('artikel')}
            className="btn-tertiary focus-ring flex items-center gap-1 text-xs sm:text-sm"
          >
            Lihat Semua
            <ArrowRight className="icon-xs" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-custom text-left -mx-4 px-4 sm:mx-0 sm:px-0">
          {articles.slice(0, 4).map((post) => (
            <article
              key={post.slug}
              className="min-w-[280px] sm:min-w-[340px] max-w-[340px] bg-bg-surface border border-primary/5 hover:border-secondary/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-standard flex flex-col justify-between card-interactive"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold">
                    <span className="px-2.5 py-0.5 bg-primary/5 text-primary rounded-md uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-primary line-clamp-2 hover:text-secondary transition-standard">
                    {post.title}
                  </h4>
                  <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('artikel-detail', post.slug)}
                  className="btn-tertiary text-xs font-bold flex items-center gap-1 self-start mt-2"
                >
                  Baca Selengkapnya
                  <ChevronRight className="icon-xs" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
