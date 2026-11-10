import assert from 'node:assert/strict';
import test from 'node:test';
import {
    dashboardCsv,
    summarizeDashboard,
} from '../../resources/js/lib/dashboard.ts';

const months = [
    { month: '2025-01', revenue: 120, orders: 2, newCustomers: 1 },
    { month: '2025-02', revenue: 450, orders: 3, newCustomers: 2 },
    { month: '2025-03', revenue: 100, orders: 1, newCustomers: 1 },
    { month: '2025-04', revenue: 750, orders: 5, newCustomers: 3 },
];

await test('selecting a period updates totals and uses a weighted order average', () => {
    const report = summarizeDashboard(months, 3);

    assert.deepEqual(
        report.months.map(({ month }) => month),
        ['2025-02', '2025-03', '2025-04'],
    );
    assert.equal(report.revenue, 1300);
    assert.equal(report.orders, 9);
    assert.equal(report.newCustomers, 6);
    assert.equal(report.averageOrderValue, 1300 / 9);
    assert.equal(months.length, 4);
});

await test('a period longer than the available history includes all data', () => {
    assert.equal(summarizeDashboard(months, 12).revenue, 1420);
});

await test('empty data and months without orders never produce an invalid average', () => {
    assert.equal(summarizeDashboard([], 6).averageOrderValue, 0);
    assert.equal(
        summarizeDashboard(
            [{ month: '2025-01', revenue: 0, orders: 0, newCustomers: 0 }],
            3,
        ).averageOrderValue,
        0,
    );
});

await test('CSV exports only the selected period with exact numeric values', () => {
    const report = summarizeDashboard(months, 1);

    assert.equal(
        dashboardCsv(report.months),
        '"Month","Revenue (USD)","Orders","New customers"\r\n"2025-04","750","5","3"',
    );
});

await test('CSV escapes quotes and neutralizes spreadsheet formulas', () => {
    assert.equal(
        dashboardCsv([{ ...months[0], month: '=HYPERLINK("example")' }]),
        '"Month","Revenue (USD)","Orders","New customers"\r\n"\'=HYPERLINK(""example"")","120","2","1"',
    );
});
