import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { DetailList, type DetailItem } from '@/components/admin/detail-list';
import { ArticleContent } from '@/components/article-content';
import { EmptyState } from '@/components/empty-state';
import { EventBadges } from '@/components/event-badges';
import {
    Frame,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { eventDate, eventTypeLabels } from '@/lib/events';
import { formatDateTime } from '@/lib/format';
import { edit, index } from '@/routes/admin/events';
import { show as publicShow } from '@/routes/events';
import type { Event } from '@/types/event';

function externalValue(href: string | null) {
    if (!href) {
        return null;
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline underline-offset-4"
        >
            {href}
        </a>
    );
}

export default function Show({ event }: { event: Event }) {
    const schedule: DetailItem[] = [
        { label: 'Mulai', value: eventDate(event.start_at, event.timezone) },
        { label: 'Selesai', value: eventDate(event.end_at, event.timezone) },
        { label: 'Zona waktu', value: event.timezone },
        { label: 'Tipe', value: eventTypeLabels[event.type] },
    ];
    const place: DetailItem[] = [
        { label: 'Nama lokasi', value: event.location_name },
        { label: 'Alamat', value: event.address, wide: true },
        { label: 'Peta', value: externalValue(event.map_url) },
        {
            label: 'Tautan pertemuan',
            value: externalValue(event.meeting_url),
        },
        {
            label: 'Tautan pendaftaran',
            value: externalValue(event.registration_url),
        },
        { label: 'WhatsApp panitia', value: event.contact_whatsapp },
    ];

    return (
        <AdminPage
            title={event.title}
            description={event.summary ?? undefined}
            actions={
                <>
                    <Button type="button" variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft aria-hidden />
                            Daftar event
                        </Link>
                    </Button>
                    {event.status === 'published' && (
                        <Button type="button" variant="outline" asChild>
                            <a
                                href={publicShow.url(event.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink aria-hidden />
                                Lihat di situs
                            </a>
                        </Button>
                    )}
                    <Button type="button" asChild>
                        <Link href={edit(event.id)}>
                            <Pencil aria-hidden />
                            Edit
                        </Link>
                    </Button>
                </>
            }
        >
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Deskripsi</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            {event.banner_url && (
                                <img
                                    src={event.banner_url}
                                    alt=""
                                    className="aspect-video w-full object-cover"
                                />
                            )}
                            {event.description ? (
                                <ArticleContent html={event.description} />
                            ) : (
                                <EmptyState title="Event belum memiliki deskripsi" />
                            )}
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Lokasi dan kontak</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList items={place} />
                        </FramePanel>
                    </Frame>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Jadwal</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            <EventBadges
                                status={event.status}
                                phase={event.phase}
                            />
                            <DetailList columns={1} items={schedule} />
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Informasi</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Penyelenggara',
                                        value: event.organizer?.name,
                                    },
                                    {
                                        label: 'Kategori',
                                        value: event.categories
                                            .map((item) => item.name)
                                            .join(', '),
                                    },
                                    { label: 'Slug', value: event.slug },
                                    {
                                        label: 'Dibuat',
                                        value: formatDateTime(event.created_at),
                                    },
                                    {
                                        label: 'Diperbarui',
                                        value: formatDateTime(event.updated_at),
                                    },
                                ]}
                            />
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Mesin pencari</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Judul meta',
                                        value: event.meta_title,
                                    },
                                    {
                                        label: 'Deskripsi meta',
                                        value: event.meta_description,
                                    },
                                ]}
                            />
                        </FramePanel>
                    </Frame>
                </div>
            </div>
        </AdminPage>
    );
}
