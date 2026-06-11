import Phone from 'lucide-react/dist/esm/icons/phone';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import { CONTACT } from '@/constants/links';

/**
 * WhatsApp helpdesk links for PSB committee.
 * Imports contact numbers from @/constants/links (not hardcoded).
 *
 * @param {{ santriData: object }} props
 */
export function HelpdeskContacts({ santriData }) {
  const waMessageText = encodeURIComponent(
    `Assalamualaikum Panitia PSB Ma'unah Sari, saya calon santri ${santriData.name} dengan no reg ${santriData.regNo}. Ingin bertanya mengenai...`
  );

  return (
    <div className="bg-card border border-primary/5 rounded-2xl p-6 shadow-sm space-y-4">
      <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2">
        <Phone className="w-4 h-4 text-secondary" /> Layanan Bantuan PSB
      </h4>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Butuh bantuan terkait jadwal sowan, perubahan berkas, atau hal administratif? Silakan kontak sekretariat panitia PSB.
      </p>
      <div className="space-y-2">
        <a
          href={`https://wa.me/${CONTACT.whatsapp.putra}?text=${waMessageText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 w-full flex items-center justify-center gap-2 py-2 px-3 bg-secondary/15 hover:bg-secondary/25 text-primary rounded-lg text-xs font-bold transition-colors cursor-pointer border border-secondary/10"
        >
          <span>Chat WhatsApp Panitia (Putra)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={`https://wa.me/${CONTACT.whatsapp.putri}?text=${waMessageText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 w-full flex items-center justify-center gap-2 py-2 px-3 border border-primary/10 hover:bg-primary/5 text-primary rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <span>Chat WhatsApp Panitia (Putri)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
