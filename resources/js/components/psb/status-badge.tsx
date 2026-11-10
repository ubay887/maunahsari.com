import { Badge } from '@/components/reui/badge';
import { statusLabels } from '@/lib/psb';
import type { ApplicantStatus } from '@/types/psb';
const variants = {
    registered: 'primary-light',
    verified: 'info-light',
    accepted: 'success-light',
    rejected: 'destructive-light',
    cancelled: 'warning-light',
} as const;
export function StatusBadge({ status }: { status: ApplicantStatus }) {
    return <Badge variant={variants[status]}>{statusLabels[status]}</Badge>;
}
