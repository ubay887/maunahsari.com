import { Button } from '@/components/ui/button';
import type { Period } from '@/types/psb';
export function Contacts({ period }: { period: Period | null }) {
    return (
        <div className="flex flex-wrap gap-2">
            {(['putra', 'putri'] as const).map((pondok) => {
                const phone = period?.[`contact_whatsapp_${pondok}`];
                return phone ? (
                    <Button
                        key={pondok}
                        type="button"
                        variant="outline"
                        asChild
                    >
                        <a
                            href={`https://wa.me/${phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WhatsApp {pondok}
                        </a>
                    </Button>
                ) : (
                    <p key={pondok} className="text-sm text-muted-foreground">
                        Kontak {pondok} belum diatur.
                    </p>
                );
            })}
        </div>
    );
}
