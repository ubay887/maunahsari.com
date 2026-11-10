import { Link } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/events';
import EventForm from './event-form';
import type { EventFormProps } from '@/types/event';

export default function Edit(props: EventFormProps) {
    return (
        <AdminPage
            title="Edit event"
            description={props.event?.title}
            actions={
                props.event && (
                    <Button type="button" variant="outline" asChild>
                        <Link
                            href={show(props.event.slug, {
                                query: { preview: 1 },
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Pratinjau event
                        </Link>
                    </Button>
                )
            }
        >
            <EventForm {...props} />
        </AdminPage>
    );
}
