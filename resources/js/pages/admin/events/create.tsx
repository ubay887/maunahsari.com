import { AdminPage } from '@/components/admin/admin-page';
import EventForm from './event-form';
import type { EventFormProps } from '@/types/event';

export default function Create(props: EventFormProps) {
    return (
        <AdminPage
            title="Buat event"
            description="Atur kegiatan dan jadwal pesantren."
        >
            <EventForm {...props} />
        </AdminPage>
    );
}
