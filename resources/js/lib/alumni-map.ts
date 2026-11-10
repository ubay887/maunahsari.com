import type { MapGroup } from '@/types/alumni';

export const MIN_MARKER_RADIUS = 6;
export const MAX_MARKER_RADIUS = 20;

/**
 * Circle radius in pixels. Area (not radius) tracks the count, so a region
 * with four times the alumni looks twice as wide, while a single alumnus
 * still gets a visible marker.
 */
export function markerRadius(count: number, maxCount: number): number {
    if (count <= 0 || maxCount <= 0) {
        return MIN_MARKER_RADIUS;
    }
    const share = Math.min(1, count / maxCount);

    return (
        MIN_MARKER_RADIUS +
        Math.sqrt(share) * (MAX_MARKER_RADIUS - MIN_MARKER_RADIUS)
    );
}

export function sameRegion(
    group: Pick<MapGroup, 'id' | 'level'>,
    id: string | undefined,
    level: string | undefined,
): boolean {
    return (
        id !== undefined &&
        level !== undefined &&
        String(group.id) === id &&
        group.level === level
    );
}

/** Largest regions first; ties are ordered by name. */
export function rankGroups(groups: MapGroup[]): MapGroup[] {
    return [...groups].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'id'),
    );
}

export type MapSummary = {
    total: number;
    regions: number;
    provinces: number;
};

export function summarizeGroups(groups: MapGroup[], total: number): MapSummary {
    return {
        total,
        regions: groups.length,
        provinces: new Set(groups.map((group) => group.province)).size,
    };
}

/** Bar width as a whole percentage, never invisible for a real count. */
export function barPercent(count: number, maxCount: number): number {
    if (count <= 0 || maxCount <= 0) return 0;

    return Math.max(4, Math.round((count / maxCount) * 100));
}
