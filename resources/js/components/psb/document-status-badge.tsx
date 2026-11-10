import { Badge } from '@/components/reui/badge';
import type { PortalDocument } from '@/types/psb';

export function DocumentStatusBadge({
    document,
}: {
    document: Pick<PortalDocument, 'id' | 'is_verified'>;
}) {
    if (document.is_verified) {
        return <Badge variant="success-light">Terverifikasi</Badge>;
    }

    return document.id === null ? (
        <Badge variant="warning-light">Belum diunggah</Badge>
    ) : (
        <Badge variant="info-light">Menunggu verifikasi</Badge>
    );
}
