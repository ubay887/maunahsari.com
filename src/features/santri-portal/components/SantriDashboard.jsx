import { useState } from 'react';
import Printer from 'lucide-react/dist/esm/icons/printer';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { loadSantriData } from '../data/santriMockData';
import { RegistrationStatus } from './RegistrationStatus';
import { SelectionTimeline } from './SelectionTimeline';
import { ProgramInfo } from './ProgramInfo';
import { HelpdeskContacts } from './HelpdeskContacts';
import { ExamCardPrintModal } from './ExamCardPrintModal';

export function SantriDashboard() {
  const [santriData] = useState(() => loadSantriData());
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <div className="w-full space-y-8 animate-fade-in text-left">
      {/* Welcome Section */}
      <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden text-center md:text-left">
        <div className="absolute inset-y-0 right-0 w-32 opacity-10 pointer-events-none">
          <IslamicPattern variant="geometric" opacity={0.3} />
        </div>

        <div className="space-y-1 relative z-10">
          <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Portal Calon Santri</span>
          <h3 className="font-display text-xl md:text-2xl text-primary font-bold">Selamat Datang, {santriData.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">ID Registrasi: {santriData.regNo} | NIK: {santriData.nik}</p>
        </div>

        <div className="w-full md:w-auto flex shrink-0 relative z-10 justify-center">
          <button
            onClick={() => setShowPrintModal(true)}
            className="min-h-11 py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-primary rounded-lg text-xs font-bold transition-standard flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-ring w-full md:w-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu Ujian</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left Area: Status & Timeline */}
        <div className="md:col-span-2 space-y-6">
          <RegistrationStatus status={santriData.status} />
          <SelectionTimeline santriData={santriData} />
        </div>

        {/* Right Area: Program Info & Contacts */}
        <div className="space-y-6">
          <ProgramInfo santriData={santriData} />
          <HelpdeskContacts santriData={santriData} />
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <ExamCardPrintModal
          santriData={santriData}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
