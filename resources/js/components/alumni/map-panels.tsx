import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { barPercent, rankGroups, sameRegion } from '@/lib/alumni-map';
import { cn } from '@/lib/utils';
import type { MapData, MapGroup } from '@/types/alumni';

const COLLAPSED_ROWS = 8;

type Row = {
    key: string;
    name: string;
    label: string;
    detail?: string | null;
    count: number;
    active?: boolean;
    onSelect?: () => void;
};

function StatRow({ row, max }: { row: Row; max: number }) {
    const content = (
        <>
            <span className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 break-words">
                    {row.name}
                    {row.detail && (
                        <span className="block text-xs text-muted-foreground">
                            {row.detail}
                        </span>
                    )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {row.label}
                </span>
            </span>
            <span
                aria-hidden
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
                <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${barPercent(row.count, max)}%` }}
                />
            </span>
        </>
    );
    const base =
        'flex w-full flex-col gap-1 rounded-md px-2 py-1.5 text-left text-sm';

    return (
        <li>
            {row.onSelect ? (
                <button
                    type="button"
                    aria-pressed={row.active}
                    onClick={row.onSelect}
                    className={cn(
                        base,
                        'transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                        row.active && 'bg-muted',
                    )}
                >
                    {content}
                </button>
            ) : (
                <div className={base}>{content}</div>
            )}
        </li>
    );
}

function RowList({
    rows,
    loading,
    onReset,
}: {
    rows: Row[];
    loading: boolean;
    onReset: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const max = Math.max(1, ...rows.map((row) => row.count));
    const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

    if (loading) {
        return (
            <div className="flex flex-col gap-3" role="status">
                <span className="sr-only">Memuat ringkasan…</span>
                {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-8 w-full" />
                ))}
            </div>
        );
    }
    if (!rows.length) {
        return (
            <EmptyState
                title="Belum ada data"
                description="Tidak ada wilayah yang sesuai filter."
                action={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                    >
                        Reset filter
                    </Button>
                }
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-1">
                {visible.map((row) => (
                    <StatRow key={row.key} row={row} max={max} />
                ))}
            </ul>
            {rows.length > COLLAPSED_ROWS && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded
                        ? 'Ringkas daftar'
                        : `Tampilkan semua (${rows.length})`}
                </Button>
            )}
        </div>
    );
}

/**
 * Accessible twin of the map: every region on the map is also a row here, so
 * keyboard and screen-reader users reach the same selection.
 */
export function AggregatePanel({
    aggregate,
    filters,
    loading,
    onSelect,
    onReset,
}: {
    aggregate: MapData;
    filters: Record<string, string>;
    loading: boolean;
    onSelect: (group: MapGroup) => void;
    onReset: () => void;
}) {
    const regions: Row[] = rankGroups(aggregate.groups).map((group) => ({
        key: `${group.level}-${group.id}`,
        name: group.name,
        label: group.label,
        detail: group.province,
        count: group.count,
        active: sameRegion(group, filters.region_id, filters.region_level),
        onSelect: () => onSelect(group),
    }));
    const batches: Row[] = aggregate.by_angkatan.map((item) => ({
        key: item.name,
        name: item.name,
        label: item.label,
        count: item.count,
    }));

    return (
        <Tabs defaultValue="regions">
            <TabsList>
                <TabsTrigger value="regions">Kota/kabupaten</TabsTrigger>
                <TabsTrigger value="batches">Angkatan</TabsTrigger>
            </TabsList>
            <TabsContent value="regions">
                <RowList rows={regions} loading={loading} onReset={onReset} />
            </TabsContent>
            <TabsContent value="batches">
                <RowList rows={batches} loading={loading} onReset={onReset} />
            </TabsContent>
        </Tabs>
    );
}
