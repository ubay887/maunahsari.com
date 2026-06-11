import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/features/auth';
import logoImg from '@/assets/images/logos/seal_logo.png';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Home from 'lucide-react/dist/esm/icons/home';
import IslamicPattern from '@/components/ui/IslamicPattern';

export default function DashboardLayout({ children }) {
  const { navigate } = useNavigation();
  const { isLoggedIn, userRole, logout } = useAuth();

  const getRoleLabel = () => {
    if (!isLoggedIn) return 'Portal Akses';
    if (userRole === 'santri') return 'Calon Santri';
    if (userRole === 'alumni') return 'Alumni HAMAS';
    return 'Anggota';
  };

  const getRoleColor = () => {
    if (!isLoggedIn) return 'bg-primary/10 text-primary border-primary/20';
    if (userRole === 'santri') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    if (userRole === 'alumni') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    return 'bg-secondary/15 text-primary border-secondary/25';
  };

  const getPulsingColor = () => {
    if (userRole === 'santri') return 'bg-amber-600';
    if (userRole === 'alumni') return 'bg-emerald-600';
    return 'bg-secondary';
  };

  const getPingColor = () => {
    if (userRole === 'santri') return 'bg-amber-500';
    if (userRole === 'alumni') return 'bg-emerald-500';
    return 'bg-secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#165c3b]/5 text-foreground flex flex-col font-sans antialiased relative overflow-x-hidden p-4 md:p-6 gap-2">
      {/* Background Watermark Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <IslamicPattern variant="sparse-star" opacity={0.06} className="text-secondary/40" />
      </div>

      {/* Skip to Content for Accessibility */}
      <a
        href="#portal-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-secondary focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Lompati ke konten utama
      </a>

      {/* Top Floating Navigation Bar - Capsule Glassmorphism */}
      <header className="w-full max-w-5xl mx-auto bg-card/85 backdrop-blur-md border border-secondary/20 shadow-lg px-4 md:px-6 py-3 rounded-2xl relative z-50">
        <div className="flex items-center justify-between">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo PTQ Ma'unah Sari"
              className="w-9 h-9 object-contain bg-white rounded-full p-0.5 border border-primary/10"
            />
            <div className="text-left">
              <h1 className="font-display text-sm font-bold tracking-wide text-primary leading-none">
                Portal Terpadu
              </h1>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5 block">
                PTQ Ma'unah Sari Kediri
              </span>
            </div>
            {/* Role Badge with pulsing indicator */}
            <span className={`hidden sm:flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getRoleColor()}`}>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getPingColor()}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${getPulsingColor()}`}></span>
              </span>
              {getRoleLabel()}
            </span>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Back to Public Web Link */}
            <button
              onClick={() => navigate('beranda')}
              className="w-10 h-10 sm:w-auto sm:h-auto sm:py-1.5 sm:px-3.5 bg-secondary/10 hover:bg-secondary/20 text-primary border border-secondary/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-ring shadow-sm"
              aria-label="Kembali ke website utama"
            >
              <Home className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="hidden sm:inline">Website Utama</span>
            </button>

            {/* Logout button if logged in */}
            {isLoggedIn && (
              <button
                onClick={logout}
                className="w-10 h-10 sm:w-auto sm:h-auto sm:py-1.5 sm:px-3.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-ring shadow-sm"
                aria-label="Keluar dari portal"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="portal-content" className="w-full max-w-5xl mx-auto py-4 flex-grow flex flex-col justify-start relative z-10 outline-none">
        {children}
      </main>

      {/* Floating Portal Footer - Capsule Glassmorphism */}
      <footer className="w-full max-w-5xl mx-auto bg-card/85 backdrop-blur-md border border-primary/10 py-5 px-4 md:px-6 rounded-2xl text-[10px] text-muted-foreground text-center relative z-10 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            &copy; {new Date().getFullYear()} PTQ Ma'unah Sari Kediri. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('beranda')}
              className="hover:text-primary hover:underline cursor-pointer"
            >
              Halaman Utama
            </button>
            <span>&bull;</span>
            <button
              onClick={() => navigate('narahubung')}
              className="hover:text-primary hover:underline cursor-pointer"
            >
              Hubungi Admin
            </button>
            <span>&bull;</span>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline"
            >
              Bantuan WA
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
