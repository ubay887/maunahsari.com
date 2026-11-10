import assert from 'node:assert/strict';
import test from 'node:test';
import {
    distanceBand,
    privacyDefaults,
} from '../../resources/js/lib/alumni.ts';
await test('distance bands include their upper boundaries', () => {
    for (const [distance, label] of [
        [0, 'dalam 25 km'],
        [25, 'dalam 25 km'],
        [25.01, 'dalam 50 km'],
        [50, 'dalam 50 km'],
        [50.01, 'dalam 100 km'],
        [100, 'dalam 100 km'],
    ])
        assert.equal(distanceBand(distance), label);
});
await test('invalid distances are rejected', () => {
    for (const value of [-1, NaN, Infinity])
        assert.throws(() => distanceBand(value), RangeError);
});
await test('privacy starts without map or directory consent and fields are private', () => {
    const result = privacyDefaults(null, {
        privacyVersion: '2026-11-03',
        visibilityFields: ['full_name', 'photo'],
        provinces: [],
        regencies: [],
        programs: [],
    });
    assert.equal(result.map_mode, '');
    assert.equal(result.directory_visible, '');
    assert.equal(result.privacy_consent, false);
    assert.deepEqual(result.field_visibility, {
        full_name: 'private',
        photo: 'private',
    });
});
const mapHelpers = await import('../../resources/js/lib/alumni-map.ts');
await test('marker radius grows with count and a single alumnus stays visible', () => {
    const { markerRadius, MIN_MARKER_RADIUS, MAX_MARKER_RADIUS } = mapHelpers;
    assert.ok(markerRadius(1, 10) >= MIN_MARKER_RADIUS);
    assert.ok(markerRadius(1, 10) < markerRadius(9, 10));
    assert.equal(markerRadius(10, 10), MAX_MARKER_RADIUS);
    assert.equal(markerRadius(50, 10), MAX_MARKER_RADIUS);
    assert.equal(markerRadius(0, 10), MIN_MARKER_RADIUS);
});
await test('groups rank by real count and summarize totals and provinces', () => {
    const group = (id, name, count, province) => ({
        level: 'regency',
        id,
        name,
        province,
        latitude: 0,
        longitude: 0,
        count,
        label: String(count),
    });
    const ranked = mapHelpers.rankGroups([
        group(1, 'B', 1, 'P1'),
        group(2, 'C', 3, 'P1'),
        group(3, 'A', 5, 'P2'),
    ]);
    assert.deepEqual(
        ranked.map((item) => item.id),
        [3, 2, 1],
    );
    assert.deepEqual(mapHelpers.summarizeGroups(ranked, 9), {
        total: 9,
        regions: 3,
        provinces: 2,
    });
    assert.equal(mapHelpers.barPercent(0, 5), 0);
    assert.equal(mapHelpers.barPercent(1, 100), 4);
    assert.equal(mapHelpers.barPercent(5, 5), 100);
});
