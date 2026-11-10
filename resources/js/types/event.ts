import type { Taxonomy } from '@/types/article';

export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventType = 'offline' | 'online' | 'hybrid';
export type EventPhase = 'upcoming' | 'ongoing' | 'past';
export type Event = {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    description: string;
    banner: string | null;
    banner_url: string | null;
    start_at: string;
    end_at: string;
    timezone: string;
    type: EventType;
    status: EventStatus;
    phase: EventPhase;
    location_name: string | null;
    address: string | null;
    map_url: string | null;
    meeting_url: string | null;
    registration_url: string | null;
    contact_whatsapp: string | null;
    meta_title: string | null;
    meta_description: string | null;
    categories: Taxonomy[];
    organizer: { id: number; name: string };
    created_at: string;
    updated_at: string;
};
export type EventCardData = Pick<
    Event,
    | 'id'
    | 'title'
    | 'slug'
    | 'summary'
    | 'banner_url'
    | 'start_at'
    | 'end_at'
    | 'timezone'
    | 'type'
    | 'status'
    | 'phase'
    | 'location_name'
    | 'categories'
>;
export type EventRow = Pick<
    Event,
    | 'id'
    | 'title'
    | 'slug'
    | 'summary'
    | 'banner_url'
    | 'start_at'
    | 'end_at'
    | 'timezone'
    | 'type'
    | 'status'
    | 'phase'
    | 'location_name'
    | 'contact_whatsapp'
    | 'categories'
    | 'organizer'
    | 'created_at'
    | 'updated_at'
>;
export type EventFormProps = {
    event?: Event;
    categories: Taxonomy[];
    statuses: { value: EventStatus; label: string }[];
    types: { value: EventType; label: string }[];
    startLocal?: string;
    endLocal?: string;
};
export type AdminEventFilters = {
    search: string;
    status: string;
    type: string;
    date_from: string;
    date_to: string;
    sort: string;
    direction: string;
};
