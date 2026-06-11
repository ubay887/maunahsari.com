import Printer from 'lucide-react/dist/esm/icons/printer';
import { IslamicRosette, OrnamentalCorner } from '@/components/ui/IslamicPattern';
import logoImg from '@/assets/images/logos/seal_logo.png';

/**
 * Print modal overlay for the exam admission card (Kartu Ujian).
 *
 * @param {{ santriData: object, onClose: () => void }} props
 */
export function ExamCardPrintModal({ santriData, onClose }) {
  return (
    <div
      id="print-card-modal-overlay"
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Kartu Ujian dan Bukti Pendaftaran"
    >
      <div className="bg-card max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl relative border border-primary/10 flex flex-col text-left max-h-[90vh] overflow-y-auto">
        <OrnamentalCorner position="top-left" size="sm" />
        <OrnamentalCorner position="top-right" size="sm" />

        <div className="p-6 space-y-6">
          {/* Print area container */}
          <div id="print-card-area" className="border-2 border-double border-primary/20 p-4 rounded-xl bg-card relative overflow-hidden space-y-4">
            {/* Subtle watermark */}
            <div className="absolute inset-0 z-0 opacity-[0.015] flex items-center justify-center pointer-events-none">
              <IslamicRosette size="lg" />
            </div>

            <div className="flex items-center gap-3 border-b border-primary/10 pb-3 relative z-10">
              <img src={logoImg} alt="Logo PTQ Ma'unah Sari" className="w-12 h-12 bg-white rounded-full p-0.5" />
              <div>
                <h4 className="font-display font-bold text-sm text-primary leading-tight">KARTU UJIAN &amp; BUKTI PENDAFTARAN</h4>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">PSB TA 2026/2027 • PTQ MA&apos;UNAH SARI</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-2.5 gap-x-2 text-[11px] relative z-10 text-muted-foreground">
              <div className="font-semibold text-muted-foreground">No. Registrasi</div>
              <div className="col-span-2 font-bold text-primary font-mono">{santriData.regNo}</div>

              <div className="font-semibold text-muted-foreground">Nama Lengkap</div>
              <div className="col-span-2 font-bold text-primary">{santriData.name}</div>

              <div className="font-semibold text-muted-foreground">NIK</div>
              <div className="col-span-2 font-mono">{santriData.nik}</div>

              <div className="font-semibold text-muted-foreground">Program Studi</div>
              <div className="col-span-2">{santriData.program}</div>

              <div className="font-semibold text-muted-foreground">Unit Pondok</div>
              <div className="col-span-2">{santriData.pondok}</div>

              <div className="font-semibold text-muted-foreground">Jadwal Sowan</div>
              <div className="col-span-2 text-primary font-bold">{santriData.schedule.day}, {santriData.schedule.date}</div>

              <div className="font-semibold text-muted-foreground">Waktu / Lokasi</div>
              <div className="col-span-2">{santriData.schedule.time} / {santriData.schedule.location}</div>
            </div>

            <div className="border-t border-primary/10 pt-3 flex justify-between items-center text-[9px] relative z-10 text-muted-foreground">
              <span>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</span>
              <span className="font-bold text-primary uppercase">Panitia PSB Online</span>
            </div>
          </div>

          {/* Info and action */}
          <div id="print-card-controls" className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tunjukkan bukti pendaftaran digital ini kepada panitia saat hadir di kantor pesantren untuk pelaksanaan ujian lisan dan sowan pengasuh. Anda juga dapat menyimpannya sebagai berkas PDF/cetak.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="min-h-11 btn-primary flex-1 justify-center text-xs cursor-pointer focus:outline-none focus-ring"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang</span>
              </button>
              <button
                onClick={onClose}
                className="min-h-11 py-2.5 px-4 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-lg text-xs font-bold transition-standard flex-1 justify-center cursor-pointer focus:outline-none focus-ring"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
