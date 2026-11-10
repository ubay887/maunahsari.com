import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { markerRadius } from '@/lib/alumni-map';
import type { MapGroup } from '@/types/alumni';

export type TileConfig = {
    url: string | null;
    dark_url: string | null;
    attribution: string;
};

const INDONESIA_CENTER: [number, number] = [-2.5, 118];

function isDark(): boolean {
    return document.documentElement.classList.contains('dark');
}

/**
 * Aggregate region map. The Leaflet instance is created once; markers are
 * redrawn when the groups or the selection change, so filtering never
 * rebuilds the map or resets the viewport mid-interaction.
 */
export function RegionMap({
    groups,
    tiles,
    selected,
    onSelect,
}: {
    groups: MapGroup[];
    tiles: TileConfig;
    selected: MapGroup | null;
    onSelect?: (group: MapGroup) => void;
}) {
    const { url, dark_url: darkUrl, attribution } = tiles;
    const element = useRef<HTMLDivElement>(null);
    const map = useRef<LeafletMap | null>(null);
    const layer = useRef<LayerGroup | null>(null);
    const leaflet = useRef<typeof import('leaflet') | null>(null);
    const onSelectRef = useRef(onSelect);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const maxCount = useMemo(
        () => Math.max(1, ...groups.map((group) => group.count)),
        [groups],
    );

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useEffect(() => {
        let cancelled = false;
        let observer: MutationObserver | undefined;
        void import('leaflet')
            .then((L) => {
                if (cancelled || !element.current) return;
                const reduce = window.matchMedia(
                    '(prefers-reduced-motion: reduce)',
                ).matches;
                const instance = L.map(element.current, {
                    center: INDONESIA_CENTER,
                    zoom: 5,
                    minZoom: 4,
                    maxZoom: 12,
                    maxBounds: [
                        [-16, 90],
                        [10, 145],
                    ],
                    maxBoundsViscosity: 0.8,
                    zoomAnimation: !reduce,
                    fadeAnimation: !reduce,
                    markerZoomAnimation: !reduce,
                    scrollWheelZoom: false,
                });
                instance.on('click', () => instance.scrollWheelZoom.enable());
                instance.on('mouseout', () =>
                    instance.scrollWheelZoom.disable(),
                );
                if (url) {
                    const tile = L.tileLayer(
                        isDark() ? (darkUrl ?? url) : url,
                        {
                            attribution,
                            maxZoom: 18,
                        },
                    ).addTo(instance);
                    tile.on('tileerror', () => {
                        if (!cancelled) setError(true);
                    });
                    observer = new MutationObserver(() =>
                        tile.setUrl(isDark() ? (darkUrl ?? url) : url),
                    );
                    observer.observe(document.documentElement, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                }
                layer.current = L.layerGroup().addTo(instance);
                leaflet.current = L;
                map.current = instance;
                setReady(true);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });

        return () => {
            cancelled = true;
            observer?.disconnect();
            map.current?.remove();
            map.current = null;
            layer.current = null;
            setReady(false);
        };
    }, [url, darkUrl, attribution, retry]);

    useEffect(() => {
        const L = leaflet.current;
        const instance = map.current;
        const markers = layer.current;
        if (!ready || !L || !instance || !markers) return;
        markers.clearLayers();
        for (const group of [...groups].sort((a, b) => b.count - a.count)) {
            const active =
                selected?.id === group.id && selected.level === group.level;
            const marker = L.circleMarker([group.latitude, group.longitude], {
                radius: markerRadius(group.count, maxCount),
                color: active ? 'var(--foreground)' : 'var(--primary)',
                fillColor: 'var(--primary)',
                fillOpacity: active ? 0.85 : 0.6,
                weight: active ? 3 : 2,
            });
            marker.bindTooltip(`${group.name}: ${group.label} alumni`, {
                direction: 'top',
            });
            marker.on('click', () => onSelectRef.current?.(group));
            marker.addTo(markers);
        }
    }, [groups, selected, maxCount, ready]);

    const fitKey = groups.map((group) => `${group.level}${group.id}`).join();
    useEffect(() => {
        const instance = map.current;
        if (!ready || !instance) return;
        if (!groups.length) {
            instance.setView(INDONESIA_CENTER, 5, { animate: false });

            return;
        }
        instance.fitBounds(
            groups.map(
                (group) =>
                    [group.latitude, group.longitude] as [number, number],
            ),
            { padding: [40, 40], maxZoom: 8, animate: false },
        );
        // Refit only when the set of regions changes, not on selection.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fitKey, ready]);

    useEffect(() => {
        const instance = map.current;
        if (!ready || !instance || !selected) return;
        instance.panTo([selected.latitude, selected.longitude]);
    }, [selected, ready]);

    return (
        <div className="relative flex min-w-0 flex-col gap-2">
            <div
                ref={element}
                role="region"
                aria-label="Peta agregat alumni di pusat kota/kabupaten dan provinsi"
                style={{ backgroundColor: 'var(--muted)' }}
                className="relative z-0 h-[22rem] w-full overflow-hidden rounded-md border bg-muted sm:h-[30rem]"
            />
            {!ready && !error && (
                <Skeleton
                    role="status"
                    aria-label="Memuat peta"
                    className="absolute inset-0 rounded-md"
                />
            )}
            {error && (
                <div
                    role="alert"
                    className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background p-3 text-sm"
                >
                    <p>Peta dasar gagal dimuat.</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setError(false);
                            setRetry((value) => value + 1);
                        }}
                    >
                        Coba lagi
                    </Button>
                </div>
            )}
            <MapLegend hasTiles={Boolean(url)} />
        </div>
    );
}

function MapLegend({ hasTiles }: { hasTiles: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
                <span
                    aria-hidden
                    className="size-2.5 rounded-full border-2 border-primary bg-primary/60"
                />
                Kota/kabupaten
            </span>
            <span>
                Ukuran lingkaran mengikuti jumlah alumni; klik untuk memilih
                wilayah
            </span>
            {!hasTiles && <span>Peta dasar belum diaktifkan pengurus.</span>}
        </div>
    );
}
