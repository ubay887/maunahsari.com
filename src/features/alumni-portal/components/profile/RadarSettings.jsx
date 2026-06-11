import MapPin from 'lucide-react/dist/esm/icons/map-pin';

export function RadarSettings({ alumniData, onToggleRadar, onUpdateGPS, onUpdateProfile }) {
  const handleGetGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onUpdateGPS(
            position.coords.latitude.toFixed(6),
            position.coords.longitude.toFixed(6)
          );
        },
        () => {
          alert('Gagal mendapatkan lokasi. Pastikan izin GPS aktif di browser Anda.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary border-b border-primary/10 pb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-secondary" /> Pengaturan Radar & Lokasi GPS HAMAS
      </h4>

      <div className="space-y-4 text-xs text-left">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="allowRadar"
            checked={alumniData.allowRadar}
            onChange={(e) => onToggleRadar(e.target.checked)}
            className="accent-secondary h-4 w-4 rounded border-primary/10 mt-0.5 cursor-pointer shrink-0"
          />
          <div className="text-left space-y-0.5">
            <label htmlFor="allowRadar" className="font-semibold text-primary cursor-pointer">
              Izinkan Profil Saya Muncul di Radar Alumni
            </label>
            <p className="text-[10px] text-muted-foreground">
              Profil Anda akan terlihat oleh sesama alumni huffadh dalam peta radius sekitar domisili Anda.
            </p>
          </div>
        </div>

        {alumniData.allowRadar && (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/5 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="font-semibold text-muted-foreground">
                Koordinat GPS Lokasi Domisili/Dakwah
              </span>
              <button
                onClick={handleGetGPS}
                className="py-2 px-3.5 bg-secondary/15 hover:bg-secondary/25 text-primary border border-secondary/15 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-ring shadow-xs"
                style={{ minHeight: '40px' }}
              >
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                <span>Dapatkan GPS Saat Ini</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div className="space-y-1.5 text-left">
                <label htmlFor="latitude-input" className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                  Latitude
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70 flex items-center justify-center">
                    <span className="text-[10px] font-bold">Y</span>
                  </div>
                  <input
                    id="latitude-input"
                    type="text"
                    value={alumniData.latitude || ''}
                    onChange={(e) => onUpdateProfile({ latitude: e.target.value })}
                    className="w-full pl-8 pr-3 py-2.5 border border-primary/10 rounded-lg bg-card text-primary text-xs focus:outline-none focus:border-secondary transition-all shadow-xs"
                    placeholder="-7.8185"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 text-left">
                <label htmlFor="longitude-input" className="block text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                  Longitude
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70 flex items-center justify-center">
                    <span className="text-[10px] font-bold">X</span>
                  </div>
                  <input
                    id="longitude-input"
                    type="text"
                    value={alumniData.longitude || ''}
                    onChange={(e) => onUpdateProfile({ longitude: e.target.value })}
                    className="w-full pl-8 pr-3 py-2.5 border border-primary/10 rounded-lg bg-card text-primary text-xs focus:outline-none focus:border-secondary transition-all shadow-xs"
                    placeholder="112.0075"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
