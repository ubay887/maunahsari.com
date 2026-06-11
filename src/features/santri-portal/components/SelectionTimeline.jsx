import { memo } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

/**
 * 4-step vertical timeline showing selection progression:
 * pendaftaran → verifikasi → ujian → pengumuman
 *
 * @param {{ santriData: object }} props
 */
export const SelectionTimeline = memo(function SelectionTimeline({ santriData }) {
  return (
    <div className="space-y-6 pt-2">
      <span className="text-xs font-bold text-primary uppercase block">Tahapan Seleksi Penerimaan</span>
      <div className="relative border-l-2 border-primary/10 pl-6 ml-3 space-y-8">
        {/* Step 1: Pendaftaran */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-card">
            <CheckCircle className="w-3.5 h-3.5" />
          </span>
          <div className="space-y-1">
            <span className="block text-xs font-bold text-primary leading-none">Pendaftaran Online Berhasil</span>
            <span className="block text-[10px] text-muted-foreground">
              Calon santri telah mengisi berkas pendaftaran online pada {santriData.dateRegistered}.
            </span>
          </div>
        </div>

        {/* Step 2: Verifikasi */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-card">
            <CheckCircle className="w-3.5 h-3.5" />
          </span>
          <div className="space-y-1">
            <span className="block text-xs font-bold text-primary leading-none">Verifikasi Dokumen Administrasi</span>
            <span className="block text-[10px] text-muted-foreground">
              Berkas fotokopi KK, NIK, dan ijazah telah diverifikasi &amp; dinyatakan Lolos Berkas.
            </span>
          </div>
        </div>

        {/* Step 3: Ujian */}
        <div className="relative">
          <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-secondary text-primary font-bold shadow-sm ring-4 ring-card text-[10px] animate-pulse">
            3
          </span>
          <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/5">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-primary leading-none">Ujian Seleksi &amp; Sowan Pengasuh</span>
              <span className="block text-[10px] text-muted-foreground">
                Calon santri dijadwalkan hadir ke pesantren untuk ujian lisan &amp; sowan kepada Pengasuh.
              </span>
            </div>
            <div className="border-t border-primary/10 pt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
              <div>Hari/Tanggal: <strong>{santriData.schedule.day}, {santriData.schedule.date}</strong></div>
              <div>Waktu: <strong>{santriData.schedule.time}</strong></div>
              <div className="col-span-2">Tempat: <strong>{santriData.schedule.location}</strong></div>
              <div className="col-span-2">Sowan Pengasuh: <strong>{santriData.schedule.examiner}</strong></div>
            </div>
            <div className="text-[9px] bg-card p-2 rounded text-amber-800 border border-amber-200">
              * {santriData.schedule.notes}
            </div>
          </div>
        </div>

        {/* Step 4: Pengumuman */}
        <div className="relative opacity-60">
          <span className="absolute -left-[31px] top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-muted text-white shadow-sm ring-4 ring-card text-[10px]">
            4
          </span>
          <div className="space-y-1">
            <span className="block text-xs font-bold text-muted-foreground leading-none">Pengumuman Kelulusan Akhir</span>
            <span className="block text-[10px] text-muted-foreground">
              Hasil seleksi akhir kelulusan diumumkan secara daring lewat portal ini pada 28 Juni 2026.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
