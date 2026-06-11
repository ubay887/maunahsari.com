import Award from 'lucide-react/dist/esm/icons/award';

/**
 * Card showing the registered program details: year, pondok unit, program.
 *
 * @param {{ santriData: object }} props
 */
export function ProgramInfo({ santriData }) {
  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-3">
        <Award className="w-4 h-4 text-secondary" /> Pilihan Program
      </h4>
      <div className="space-y-3 text-xs text-muted-foreground">
        <div>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tahun Ajaran</span>
          <strong className="text-primary font-mono text-sm">TA 2026/2027</strong>
        </div>
        <div>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Unit Pondok</span>
          <strong className="text-primary">{santriData.pondok}</strong>
        </div>
        <div>
          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Program Pembelajaran</span>
          <strong className="text-primary">{santriData.program}</strong>
        </div>
      </div>
    </div>
  );
}
