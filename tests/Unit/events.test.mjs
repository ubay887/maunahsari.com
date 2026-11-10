import assert from 'node:assert/strict';
import test from 'node:test';
import {
    eventDateFilterState,
    eventDateRangeLabel,
    eventSchedule,
} from '../../resources/js/lib/events.ts';

await test('initial and unchanged date filters cannot be applied', () => {
    assert.deepEqual(eventDateFilterState('', '', '', ''), {
        invalid: false,
        canApply: false,
    });
    assert.equal(
        eventDateFilterState(
            '2027-01-10',
            '2027-01-12',
            '2027-01-10',
            '2027-01-12',
        ).canApply,
        false,
    );
});

await test('open-ended and single-day date filters can be applied', () => {
    for (const [from, to] of [
        ['2027-01-10', ''],
        ['', '2027-01-12'],
        ['2027-01-10', '2027-01-10'],
    ]) {
        assert.deepEqual(eventDateFilterState(from, to, '', ''), {
            invalid: false,
            canApply: true,
        });
    }
});

await test('reversed dates and in-flight requests cannot be applied', () => {
    assert.deepEqual(eventDateFilterState('2027-01-12', '2027-01-10', '', ''), {
        invalid: true,
        canApply: false,
    });
    assert.deepEqual(eventDateFilterState('2027-01-10', '', '', '', true), {
        invalid: false,
        canApply: false,
    });
});

await test('clearing an applied date range is a change', () => {
    assert.equal(
        eventDateFilterState('', '', '2027-01-10', '2027-01-12').canApply,
        true,
    );
});

await test('date filter labels describe empty, open, single-day and closed ranges', () => {
    assert.equal(eventDateRangeLabel('', ''), 'Semua tanggal');
    assert.equal(eventDateRangeLabel('2027-01-10', ''), 'Sejak 10 Jan 2027');
    assert.equal(eventDateRangeLabel('', '2027-01-12'), 'Hingga 12 Jan 2027');
    assert.equal(
        eventDateRangeLabel('2027-01-10', '2027-01-10'),
        '10 Jan 2027',
    );
    assert.equal(
        eventDateRangeLabel('2027-01-10', '2027-01-12'),
        '10 Jan 2027 – 12 Jan 2027',
    );
});

await test('same-day schedules display the end time in WIB', () => {
    assert.deepEqual(
        eventSchedule('2027-01-10T01:00:00Z', '2027-01-10T03:30:00Z'),
        {
            date: '10 Jan 2027',
            time: '08.00 – 10.30 WIB',
        },
    );
});

await test('schedules crossing midnight in WIB retain the end date', () => {
    assert.deepEqual(
        eventSchedule('2027-01-10T16:00:00Z', '2027-01-10T18:00:00Z'),
        {
            date: '10 Jan 2027 – 11 Jan 2027',
            time: '23.00 – 01.00 WIB',
        },
    );
});

await test('schedules spanning UTC dates but staying on one WIB date stay compact', () => {
    assert.deepEqual(
        eventSchedule('2027-01-10T18:00:00Z', '2027-01-11T02:00:00Z'),
        {
            date: '11 Jan 2027',
            time: '01.00 – 09.00 WIB',
        },
    );
});
