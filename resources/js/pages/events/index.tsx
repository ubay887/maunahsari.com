import { Head, Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArticlePageError } from '@/components/article-page-error';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { eventTypeLabels } from '@/lib/events';
import { index } from '@/routes/events';
import type { Paginated, Taxonomy } from '@/types/article';
import type { EventCardData } from '@/types/event';

type Filters = {
    search: string;
    category: string;
    type: string;
    tab: 'upcoming' | 'past';
};
export default function Index({
    events,
    categories,
    filters,
    canonical,
}: {
    events: Paginated<EventCardData>;
    categories: Taxonomy[];
    filters: Filters;
    canonical: string;
}) {
    const page = useArticlePageState();
    const [search, setSearch] = useState(filters.search);
    function visit(changes: Record<string, string | number>) {
        router.get(
            index.url(),
            { ...filters, search, page: 1, ...changes },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onError: () => toast.error('Daftar event gagal dimuat.'),
            },
        );
    }
    return (
        <>
            <Head title="Event">
                <meta
                    head-key="description"
                    name="description"
                    content="Jadwal kajian, pendidikan, dan kegiatan Pesantren Maunahsari."
                />
                <link head-key="canonical" rel="canonical" href={canonical} />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content="Event Pesantren Maunahsari"
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content="Jadwal kajian, pendidikan, dan kegiatan Pesantren Maunahsari."
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={canonical} />
            </Head>
            <PageHeader
                size="lg"
                title="Event"
                description="Temukan jadwal kajian dan kegiatan pesantren."
            />
            <ToggleGroup
                type="single"
                variant="outline"
                value={filters.tab}
                onValueChange={(value) => {
                    if (value) visit({ tab: value });
                }}
                aria-label="Periode event"
                className="self-start"
            >
                <ToggleGroupItem type="button" value="upcoming">
                    Akan datang
                </ToggleGroupItem>
                <ToggleGroupItem type="button" value="past">
                    Sudah lewat
                </ToggleGroupItem>
            </ToggleGroup>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    visit({ search });
                }}
                className="flex flex-wrap items-end gap-3"
            >
                <Field className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <FieldLabel htmlFor="public-event-search">
                        Cari event
                    </FieldLabel>
                    <Input
                        id="public-event-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Judul atau ringkasan…"
                    />
                </Field>
                <Field className="w-auto">
                    <FieldLabel htmlFor="public-event-category">
                        Kategori
                    </FieldLabel>
                    <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) =>
                            visit({ category: value === 'all' ? '' : value })
                        }
                    >
                        <SelectTrigger id="public-event-category">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.slug}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="w-auto">
                    <FieldLabel htmlFor="public-event-type">Tipe</FieldLabel>
                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(value) =>
                            visit({ type: value === 'all' ? '' : value })
                        }
                    >
                        <SelectTrigger id="public-event-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua tipe</SelectItem>
                            {Object.entries(eventTypeLabels).map(
                                ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </Field>
                <Button type="submit">Cari</Button>
            </form>
            {page.error ? (
                <ArticlePageError retry={page.retry} />
            ) : events.data.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.data.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    bordered
                    title="Belum ada event yang sesuai"
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                visit({ search: '', category: '', type: '' });
                            }}
                        >
                            Reset filter
                        </Button>
                    }
                />
            )}
            <nav
                aria-label="Halaman event"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <p className="text-xs text-muted-foreground">
                    Halaman {events.current_page} dari {events.last_page} ·{' '}
                    {events.total} event
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={events.current_page <= 1 || page.loading}
                        asChild={events.current_page > 1 && !page.loading}
                    >
                        {events.current_page > 1 && !page.loading ? (
                            <Link
                                preserveState
                                preserveScroll
                                href={index({
                                    query: {
                                        ...filters,
                                        page: events.current_page - 1,
                                    },
                                })}
                            >
                                Sebelumnya
                            </Link>
                        ) : (
                            'Sebelumnya'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={
                            events.current_page >= events.last_page ||
                            page.loading
                        }
                        asChild={
                            events.current_page < events.last_page &&
                            !page.loading
                        }
                    >
                        {events.current_page < events.last_page &&
                        !page.loading ? (
                            <Link
                                preserveState
                                preserveScroll
                                href={index({
                                    query: {
                                        ...filters,
                                        page: events.current_page + 1,
                                    },
                                })}
                            >
                                Berikutnya
                            </Link>
                        ) : (
                            'Berikutnya'
                        )}
                    </Button>
                </div>
            </nav>
        </>
    );
}
