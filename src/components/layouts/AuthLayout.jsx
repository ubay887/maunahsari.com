import { useNavigation } from '@/contexts/NavigationContext';
import IslamicPattern from '@/components/ui/IslamicPattern';

export default function AuthLayout({ children }) {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c3e26] via-[#062416] to-[#04190f] text-white flex flex-col justify-between items-center relative overflow-hidden p-4 sm:p-6 font-sans antialiased">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <IslamicPattern variant="sparse-star" opacity={0.06} className="text-secondary" />
      </div>

      {/* Center content */}
      <main className="w-full flex-grow flex items-center justify-center z-10 py-4 outline-none">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="w-full text-center z-10 pt-6 pb-2 text-[10px] text-white/40 font-mono flex flex-col items-center gap-2">
        <button
          onClick={() => navigate('beranda')}
          className="text-secondary/70 hover:text-secondary hover:underline cursor-pointer transition-colors font-sans text-xs font-bold"
          style={{ minHeight: '36px' }}
        >
          &larr; Kembali ke Beranda
        </button>
        <div>
          &copy; {new Date().getFullYear()} PTQ Ma'unah Sari Kediri. Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
