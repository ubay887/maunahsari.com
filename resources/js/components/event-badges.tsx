import { Badge } from '@/components/reui/badge';
import {
    eventPhaseLabels,
    eventStatusLabels,
    eventTypeLabels,
} from '@/lib/events';
import type { EventPhase, EventStatus, EventType } from '@/types/event';

export function EventBadges({
    status,
    phase,
    type,
}: {
    status: EventStatus;
    phase: EventPhase;
    type?: EventType;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {type && <Badge variant="outline">{eventTypeLabels[type]}</Badge>}
            {status === 'draft' ? (
                <Badge variant="outline">{eventStatusLabels.draft}</Badge>
            ) : status === 'cancelled' ? (
                <Badge variant="destructive-light">
                    {eventStatusLabels.cancelled}
                </Badge>
            ) : (
                <Badge
                    variant={
                        phase === 'ongoing'
                            ? 'success-light'
                            : phase === 'upcoming'
                              ? 'info-light'
                              : 'invert-light'
                    }
                >
                    {eventPhaseLabels[phase]}
                </Badge>
            )}
        </div>
    );
}
