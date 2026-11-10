import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { feed as feedRoute } from '@/routes/dashboard';

export type FeedName = 'applicants' | 'events' | 'alumni';

type FeedPage<T> = { data: T[]; next_page: number | null };

type Props<T extends { id: number }> = {
    feed: FeedName;
    /** Accessible name of the scrolling region. */
    label: string;
    /** First page, already loaded by the page. */
    items: T[];
    /** Rows per page; a shorter first page means there is nothing more. */
    pageSize: number;
    renderItem: (item: T) => ReactNode;
    /** Shown instead of the list when there are no rows at all. */
    empty: ReactNode;
};

/**
 * A fixed-height card list that loads the next page when its end scrolls into
 * view, so the card never grows with the data. The server caps how many of the
 * newest rows can ever be loaded.
 */
export function InfiniteFeed<T extends { id: number }>(props: Props<T>) {
    // A new first page (after a reload) restarts the list from scratch.
    const resetKey = props.items.map((item) => item.id).join(',');

    return <FeedList key={resetKey} {...props} />;
}

function FeedList<T extends { id: number }>({
    feed,
    label,
    items,
    pageSize,
    renderItem,
    empty,
}: Props<T>) {
    const [rows, setRows] = useState(items);
    const [nextPage, setNextPage] = useState<number | null>(
        items.length >= pageSize ? 2 : null,
    );
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const loadingRef = useRef(false);
    const regionRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (nextPage === null || loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);
        setFailed(false);

        try {
            const response = await fetch(
                feedRoute({ feed }, { query: { page: nextPage } }).url,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error(`Feed request failed: ${response.status}`);
            }

            const page = (await response.json()) as FeedPage<T>;

            setRows((current) => {
                const known = new Set(current.map((row) => row.id));

                return [
                    ...current,
                    ...page.data.filter((row) => !known.has(row.id)),
                ];
            });
            setNextPage(page.next_page);
        } catch {
            setFailed(true);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [feed, nextPage]);

    useEffect(() => {
        const region = regionRef.current;
        const sentinel = sentinelRef.current;

        if (!region || !sentinel || nextPage === null || failed) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    void loadMore();
                }
            },
            { root: region, rootMargin: '0px 0px 64px 0px' },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [failed, loadMore, nextPage, rows.length]);

    if (rows.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center px-4">
                {empty}
            </div>
        );
    }

    return (
        <div
            ref={regionRef}
            role="region"
            tabIndex={0}
            aria-label={label}
            aria-busy={loading}
            className="admin-page-scroll h-80 overflow-y-auto overscroll-contain px-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
            <ul className="flex flex-col">
                {rows.map((row) => (
                    <li
                        key={row.id}
                        className="border-b border-border last:border-b-0"
                    >
                        {renderItem(row)}
                    </li>
                ))}
            </ul>
            {loading && (
                <div
                    role="status"
                    aria-label="Memuat data berikutnya"
                    className="flex flex-col gap-3 border-t border-border py-3"
                >
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            )}
            {failed && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-3 text-xs text-muted-foreground">
                    <span>Data berikutnya gagal dimuat.</span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadMore()}
                    >
                        <RefreshCw aria-hidden="true" />
                        Coba lagi
                    </Button>
                </div>
            )}
            {nextPage === null && rows.length >= pageSize && (
                <p className="border-t border-border py-3 text-center text-xs text-muted-foreground">
                    Menampilkan {rows.length.toLocaleString('id-ID')} data
                    terbaru
                </p>
            )}
            <div ref={sentinelRef} aria-hidden="true" className="h-px" />
        </div>
    );
}
