import Award from 'lucide-react/dist/esm/icons/award';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import { SYAHADAH_TYPES } from '../../data/alumniMockData';

export function SyahadahForm({
  syahadahType,
  onTypeChange,
  isGenerating,
  generatedSyahadah,
  onSubmit,
  onOpenCertificate,
}) {
  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2">
          <Award className="w-4 h-4 text-secondary" /> Permohonan Syahadah / Sertifikat Digital
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ajukan salinan syahadah atau sertifikat penyelesaian program Al-Qur'an resmi dari pesantren
          yang ditandatangani secara digital oleh pengasuh untuk keperluan administrasi atau dokumentasi pribadi.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-primary/5 p-4 rounded-xl border border-primary/5 space-y-4 text-xs">
        <div className="space-y-1">
          <label htmlFor="syahadah-select" className="block font-semibold text-muted-foreground">
            Pilih Jenis Syahadah/Sertifikat
          </label>
          <select
            id="syahadah-select"
            value={syahadahType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full p-3 border border-primary/10 rounded-lg bg-card text-primary focus:outline-none focus:border-secondary transition-colors"
            style={{ minHeight: '44px' }}
          >
            {Object.entries(SYAHADAH_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 text-muted-foreground">
          <span className="block font-semibold">Ketentuan Pengajuan:</span>
          <ul className="list-disc pl-4 space-y-1 text-[10px]">
            <li>Akun alumni Anda harus terverifikasi dalam database nasional HAMAS.</li>
            <li>Data nama pada syahadah akan disesuaikan dengan data nama lengkap terdaftar.</li>
            <li>Proses verifikasi sanad dan nomor syahadah memerlukan waktu sinkronisasi sistem.</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="btn-primary w-full justify-center !py-2.5 font-bold"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Menghubungkan Sanad Keilmuan...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Proses & Terbitkan Syahadah <Sparkles className="w-3.5 h-3.5 text-primary" />
            </span>
          )}
        </button>
      </form>

      {/* Show last generated if exists */}
      {generatedSyahadah && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="space-y-1 text-left">
            <span className="font-bold block text-emerald-900">Syahadah Digital Siap!</span>
            <p className="text-[10px] text-emerald-700 leading-none">
              Dokumen: <strong>{generatedSyahadah.title}</strong>
            </p>
          </div>
          <button
            onClick={onOpenCertificate}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-colors cursor-pointer shrink-0"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Buka Sertifikat
          </button>
        </div>
      )}
    </div>
  );
}
