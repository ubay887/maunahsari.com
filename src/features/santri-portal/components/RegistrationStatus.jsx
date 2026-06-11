import { memo } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ClipboardCheck from 'lucide-react/dist/esm/icons/clipboard-check';

/**
 * Displays current registration status with visual indicator.
 * @param {{ status: string }} props
 * @param {string} props.status - The current registration status text
 */
export const RegistrationStatus = memo(function RegistrationStatus({ status }) {
  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2 border-b border-primary/10 pb-3">
        <ClipboardCheck className="w-4 h-4 text-secondary" /> Status Pendaftaran Terkini
      </h4>

      <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Status Saat Ini</span>
          <div className="text-sm font-bold text-primary">{status}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-800" />
        </div>
      </div>
    </div>
  );
});
