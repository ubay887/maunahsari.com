import type { ApplicantStatus } from '@/types/psb';

export type RecentApplicant = {
    id: number;
    registration_number: string;
    full_name: string;
    program_name: string;
    status: ApplicantStatus;
    created_at: string | null;
};

export type AgendaEvent = {
    id: number;
    title: string;
    start_at: string;
    type: string;
    phase: 'upcoming' | 'ongoing';
};

export type QueuedAlumni = {
    id: number;
    full_name: string;
    angkatan: string | null;
    created_at: string | null;
};

export type DashboardOverview = {
    /** Rows per page of the infinite lists. */
    feedPageSize: number;
    psb: {
        period: {
            id: number;
            name: string;
            academic_year: string;
            is_open: boolean;
        } | null;
        totalApplicants: number;
        pendingApplicants: number;
        acceptedApplicants: number;
        activeSantri: number;
        recentApplicants: RecentApplicant[];
    } | null;
    articles: { total: number; published: number; draft: number } | null;
    alumni: {
        total: number;
        pending: number;
        queue: QueuedAlumni[];
    } | null;
    events: AgendaEvent[] | null;
};
