export type DashboardMonth = {
    month: string;
    revenue: number;
    orders: number;
    newCustomers: number;
};

export function summarizeDashboard(months: DashboardMonth[], period: number) {
    const selectedMonths = months.slice(-period);
    const totals = selectedMonths.reduce(
        (summary, month) => ({
            revenue: summary.revenue + month.revenue,
            orders: summary.orders + month.orders,
            newCustomers: summary.newCustomers + month.newCustomers,
        }),
        { revenue: 0, orders: 0, newCustomers: 0 },
    );

    return {
        months: selectedMonths,
        ...totals,
        averageOrderValue:
            totals.orders === 0 ? 0 : totals.revenue / totals.orders,
    };
}

export function dashboardCsv(months: DashboardMonth[]): string {
    const rows = months.map(({ month, revenue, orders, newCustomers }) => [
        month,
        revenue,
        orders,
        newCustomers,
    ]);

    return [['Month', 'Revenue (USD)', 'Orders', 'New customers'], ...rows]
        .map((row) =>
            row
                .map((value) => {
                    const cell = String(value);
                    const safeCell = /^[=+\-@\t\r\n]/.test(cell)
                        ? `'${cell}`
                        : cell;

                    return `"${safeCell.replaceAll('"', '""')}"`;
                })
                .join(','),
        )
        .join('\r\n');
}
