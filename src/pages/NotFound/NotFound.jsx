import { useNavigation } from '@/contexts/NavigationContext';

export default function NotFound() {
  const { navigate } = useNavigation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-16 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-4xl md:text-5xl text-primary font-bold">
          404
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Halaman tidak ditemukan
        </p>
      </div>

      <p className="text-muted-foreground text-xs max-w-md">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>

      <button
        onClick={() => navigate('/')}
        className="btn-primary focus-ring"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
