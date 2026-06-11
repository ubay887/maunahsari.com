import Award from 'lucide-react/dist/esm/icons/award';
import X from 'lucide-react/dist/esm/icons/x';
import Printer from 'lucide-react/dist/esm/icons/printer';
import logoImg from '@/assets/images/logos/seal_logo.png';
import { IslamicRosette, OrnamentalCorner } from '@/components/ui/IslamicPattern';

export function CertificateModal({ syahadah, alumniData, onClose }) {
  return (
    <div
      id="certificate-modal-overlay"
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto items-start md:py-12"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Syahadah Digital"
    >
      <div className="bg-card max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl relative border border-primary/10 flex flex-col text-left max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/10 sticky top-0 bg-card z-10">
          <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2">
            <Award className="w-4 h-4 text-secondary" /> Pratinjau Syahadah Digital
          </h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Certificate Content */}
        <div className="p-6 space-y-6">
          {/* Print Certificate Area */}
          <div
            id="certificate-print-area"
            className="border-8 border-double border-secondary/30 p-8 md:p-12 bg-[#FAF8F5] relative overflow-hidden rounded-xl text-center space-y-8 select-none shadow-inner"
          >
            {/* Subtle Ornamental Corner Inside Frame */}
            <OrnamentalCorner position="top-left" size="lg" className="text-secondary/70 m-2" />
            <OrnamentalCorner position="top-right" size="lg" className="text-secondary/70 m-2" />
            <OrnamentalCorner position="bottom-left" size="lg" className="text-secondary/70 m-2" />
            <OrnamentalCorner position="bottom-right" size="lg" className="text-secondary/70 m-2" />

            {/* Watermark Logo */}
            <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none z-0">
              <IslamicRosette size="xl" />
            </div>

            {/* Certificate Header */}
            <div className="space-y-4 relative z-10">
              <img
                src={logoImg}
                alt="Ma'unah Sari Seal"
                className="w-20 h-20 mx-auto object-contain bg-white rounded-full p-1 border-2 border-secondary/30 shadow-md"
              />

              <div className="space-y-1">
                <span className="block font-mono text-[10px] text-secondary tracking-widest uppercase font-bold">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>
                <h2 className="font-display text-2xl md:text-3xl text-primary font-bold">سَنَدُ التَّخَرُّجِ وَالشَّهَادَةِ</h2>
                <span className="block font-sans text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">SYAHADAH KELULUSAN PROGRAM</span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 relative z-10 max-w-lg mx-auto text-xs text-muted-foreground leading-relaxed">
              <p>
                Menerangkan dengan sesungguhnya bahwa santri alumni PTQ Ma'unah Sari Kediri yang tertera di bawah ini:
              </p>

              <div className="py-3 my-2 border-y border-secondary/20">
                <h3 className="font-display text-xl md:text-2xl text-primary font-bold">{syahadah.name}</h3>
                <span className="block text-[10px] text-muted-foreground mt-1">Nomor Anggota: {alumniData?.memberNo || 'HAMAS-ALUMNI'}</span>
              </div>

              <p>
                Dinyatakan telah menuntaskan kurikulum pengajaran dan menyelesaikan setoran dengan baik untuk program:
              </p>

              <h4 className="font-display text-base md:text-lg text-primary font-bold italic py-1 text-gradient-gold">
                "{syahadah.title}"
              </h4>

              <p>
                Serta memiliki rantai sanad hafalan Al-Qur'an Al-Karim yang tersambung sampai kepada Rasulullah SAW melalui pengawasan asuhan guru kami di Pesantren Tahfidhul Qur'an Ma'unah Sari Bandar Kidul Kediri.
              </p>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 pt-6 relative z-10 text-xs">
              <div className="text-left text-muted-foreground space-y-1">
                <div>Diterbitkan: <strong>Kediri, {syahadah.dateGenerated}</strong></div>
                <div>No. Dokumen: <strong className="font-mono">{syahadah.id}</strong></div>
              </div>
              <div className="text-right space-y-12">
                <div className="text-muted-foreground">Pengasuh PTQ Ma'unah Sari</div>
                <div className="font-display font-bold text-primary border-b border-secondary/30 inline-block pb-0.5">
                  {syahadah.signatory}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div id="certificate-print-controls" className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="min-h-11 btn-primary flex-1 justify-center text-xs cursor-pointer focus:outline-none focus-ring"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-11 flex-1 py-2.5 px-4 border border-primary/10 hover:bg-primary/5 text-primary rounded-lg text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-ring"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
