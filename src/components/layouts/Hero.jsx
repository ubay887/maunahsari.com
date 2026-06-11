import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { OrnamentalCorner, IslamicRosette } from '../ui/IslamicPattern';
import { useNavigation } from '@/contexts/NavigationContext';
import { useParallax } from '@/hooks/useParallax';

export default function Hero() {
  const { navigate } = useNavigation();
  const { parallaxY } = useParallax(0.3);

  return (
    <section className="relative overflow-hidden bg-primary text-white pt-28 pb-16 lg:pt-36 lg:pb-24 border-b-4 border-secondary shadow-lg">
      {/* Dynamic Rosette Watermarks (Elegant, minimal, and premium background details) */}
      <div 
        className="absolute -right-36 -bottom-36 w-[400px] h-[400px] md:w-[600px] md:h-[600px] text-secondary/10 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        <IslamicRosette size="full" className="animate-spin-slow" opacity={0.6} />
      </div>
      <div 
        className="absolute -left-28 -top-28 w-[300px] h-[300px] md:w-[450px] md:h-[450px] text-secondary/5 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
        style={{ transform: `translateY(${-parallaxY * 0.5}px)` }}
      >
        <IslamicRosette size="full" className="animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '35s' }} opacity={0.4} />
      </div>

      {/* Alternative Sparse Repeating Grid Option (uncomment to use) */}
      {/* 
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        <IslamicPattern variant="sparse-star" opacity={1} />
      </div>
      */}

      {/* Decorative BG Grid & Circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#092c1b_1px,transparent_1px),linear-gradient(to_bottom,#092c1b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
        style={{ transform: `translateY(${-parallaxY * 0.5}px)` }}
      ></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ transform: `translate(33%, 33%) translateY(${parallaxY * 0.3}px)` }}
      ></div>

      <div className="container-custom relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading copy & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">

          <div className="space-y-2">
            <span className="block text-xs md:text-sm font-semibold tracking-widest text-secondary uppercase leading-none">
              Selamat Datang di Portal Resmi
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight animate-fade-in-down">
              <span className="text-secondary md:text-white">P</span>esantren <span className="text-secondary md:text-white">T</span>ahfidhul <span className="text-secondary md:text-white">Q</span>ur'an <br />
              <span className="text-gradient-gold animate-float-gentle inline-block">Ma'unah Sari</span>
            </h1>
          </div>

          <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
            Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PTQ Ma'unah Sari, Bandar Kidul, Kota Kediri.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 animate-fade-in-up stagger-2">
            <button
              onClick={() => navigate('pendaftaran')}
              className="btn-primary focus-ring hover-glow"
            >
              Daftar Santri Baru
              <ArrowRight className="icon-xs group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('profil')}
              className="hidden md:flex px-6 py-3 border border-white/30 hover:border-secondary hover:bg-card/5 text-white hover:text-secondary font-semibold rounded-lg transition-standard items-center gap-1.5 focus:outline-none focus-ring"
            >
              Pelajari Profil Kami
              <ChevronRight className="icon-xs" />
            </button>
          </div>
        </div>

        {/* Right Column: Decorative Visual Callout Card */}
        <div className="lg:col-span-5 flex justify-center animate-fade-in-up stagger-3">
          <div className="relative w-full max-w-sm glass-panel rounded-2xl p-6 space-y-6 card-tilt">
            {/* Elegant Islamic Corner Ornaments */}
            <OrnamentalCorner position="top-left" size="md" className="text-secondary/40" />
            <OrnamentalCorner position="top-right" size="md" className="text-secondary/40" />
            <OrnamentalCorner position="bottom-left" size="md" className="text-secondary/40" />
            <OrnamentalCorner position="bottom-right" size="md" className="text-secondary/40" />

            {/* Top gold geometric tag */}
            <div className="absolute -top-3 -right-3 px-4 py-2 glossy-gold text-primary font-bold text-xs rounded-full uppercase tracking-wider shadow-lg rotate-12 hover:rotate-0 transition-transform duration-300">
              Sarat Barokah
            </div>

            {/* Content Info */}
            <div className="space-y-4 pt-2 text-left">
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
              <blockquote className="text-white/90 italic text-sm leading-relaxed">
                "Ngaji itu harus dengan sungguh-sungguh, kalau sudah selesai mengaji harus dijaga dengan sungguh-sungguh, tetap harus dideres (diulang), sisihkan waktu untuk muroja'ah."
              </blockquote>
              <div className="border-t border-white/10 pt-3">
                <span className="block text-xs font-bold text-secondary tracking-wide uppercase">
                  KH. R. Abdul Hamid Abdul Qodir
                </span>
                <span className="block text-[10px] text-white/60 uppercase">
                  Pengasuh PTQ Ma'unah Sari
                </span>
              </div>
            </div>

            {/* Bottom highlights stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-center">
              <div>
                <span className="block text-2xl font-bold font-display text-secondary">1967 M</span>
                <span className="block text-[10px] text-white/60 uppercase tracking-wider">Berdiri Sejak</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-display text-secondary">RMI NU</span>
                <span className="block text-[10px] text-white/60 uppercase tracking-wider">Afiliasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
