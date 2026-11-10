import type {
    FilterNode,
    FilterQuery,
} from '@/components/reui/filters/filters-types';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type Invoice = {
    id: string;
    number: string;
    customer: string;
    email: string;
    status: InvoiceStatus;
    plan: string;
    amount: number;
    issued: string;
};

const searchableFields = ['number', 'customer', 'email', 'plan'] as const;
const filterableFields = new Set([
    'number',
    'customer',
    'email',
    'status',
    'plan',
    'amount',
    'issued',
]);
const normalize = (value: unknown): string => {
    if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
    ) {
        return '';
    }

    return String(value).toLocaleLowerCase().trim();
};

function matchesNode(invoice: Invoice, node: FilterNode): boolean | undefined {
    if (node.type === 'group') {
        const results = node.rules
            .map((rule) => matchesNode(invoice, rule))
            .filter((result) => result !== undefined);

        if (results.length === 0) {
            return undefined;
        }

        return node.combinator === 'or'
            ? results.some(Boolean)
            : results.every(Boolean);
    }

    const field = node.path[0];
    if (
        !node.operator ||
        node.path.length !== 1 ||
        !filterableFields.has(field)
    ) {
        return undefined;
    }

    const actual = invoice[field as keyof Invoice];
    const values = Array.isArray(node.value) ? node.value : [node.value];
    const valueless =
        node.operator === 'empty' || node.operator === 'not_empty';
    const range =
        node.operator === 'between' || node.operator === 'not_between';

    if (
        !valueless &&
        (values.length === 0 ||
            values.some(
                (value) =>
                    value === undefined ||
                    value === null ||
                    normalize(value) === '',
            ) ||
            (range && values.length !== 2))
    ) {
        return undefined;
    }

    let result: boolean;
    const text = normalize(actual);
    const expected = normalize(values[0]);

    switch (node.operator) {
        case 'is':
            result = text === expected;
            break;
        case 'is_not':
            result = text !== expected;
            break;
        case 'contains':
            result = text.includes(expected);
            break;
        case 'not_contains':
            result = !text.includes(expected);
            break;
        case 'starts_with':
            result = text.startsWith(expected);
            break;
        case 'ends_with':
            result = text.endsWith(expected);
            break;
        case 'is_any_of':
            result = values.some((value) => text === normalize(value));
            break;
        case 'is_none_of':
            result = values.every((value) => text !== normalize(value));
            break;
        case 'empty':
            result = text === '';
            break;
        case 'not_empty':
            result = text !== '';
            break;
        case 'eq':
        case 'neq':
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
        case 'between':
        case 'not_between': {
            const numbers = values.map(Number);
            if (numbers.some((value) => !Number.isFinite(value))) {
                return undefined;
            }
            const amount = Number(actual);
            const value = numbers[0];
            if (node.operator === 'eq') {
                result = amount === value;
            } else if (node.operator === 'neq') {
                result = amount !== value;
            } else if (node.operator === 'gt') {
                result = amount > value;
            } else if (node.operator === 'gte') {
                result = amount >= value;
            } else if (node.operator === 'lt') {
                result = amount < value;
            } else if (node.operator === 'lte') {
                result = amount <= value;
            } else {
                const lower = Math.min(value, numbers[1]);
                const upper = Math.max(value, numbers[1]);
                result = amount >= lower && amount <= upper;
                if (node.operator === 'not_between') {
                    result = !result;
                }
            }
            break;
        }
        default:
            return undefined;
    }

    return node.negated ? !result : result;
}

export function filterInvoices(
    invoices: Invoice[],
    search: string,
    query: FilterQuery,
): Invoice[] {
    const term = normalize(search);

    return invoices.filter(
        (invoice) =>
            (!term ||
                searchableFields.some((field) =>
                    normalize(invoice[field]).includes(term),
                )) &&
            matchesNode(invoice, query) !== false,
    );
}

export type InvoiceSorting = { id: string; desc: boolean };

const sortableFields: Partial<
    Record<string, (invoice: Invoice) => string | number>
> = {
    number: (invoice) => invoice.number,
    customer: (invoice) => invoice.customer,
    status: (invoice) => invoice.status,
    plan: (invoice) => invoice.plan,
    amount: (invoice) => invoice.amount,
    issued: (invoice) => invoice.issued,
};

/**
 * Sorts the whole filtered ledger, so an infinite-scroll grid can cut every
 * loaded batch from one order instead of sorting each batch on its own.
 * Columns that opt out of sorting are absent from the map and ignored.
 */
export function sortInvoices(
    invoices: Invoice[],
    sorting: InvoiceSorting[],
): Invoice[] {
    const comparators = sorting.flatMap(({ id, desc }) => {
        const read = sortableFields[id];

        return read ? [{ read, direction: desc ? -1 : 1 }] : [];
    });

    if (comparators.length === 0) {
        return invoices;
    }

    return [...invoices].sort((left, right) => {
        for (const { read, direction } of comparators) {
            const first = read(left);
            const second = read(right);

            if (first === second) {
                continue;
            }

            const order =
                typeof first === 'number' && typeof second === 'number'
                    ? first - second
                    : String(first).localeCompare(String(second));

            if (order !== 0) {
                return order * direction;
            }
        }

        return 0;
    });
}

export function canUseBasicInvoiceFilters(query: FilterQuery): boolean {
    return (
        query.combinator === 'and' &&
        query.rules.every((node) => node.type === 'rule')
    );
}

export function markInvoicesPaid(
    invoices: Invoice[],
    ids: string[],
): Invoice[] {
    const selected = new Set(ids);

    return invoices.map((invoice) =>
        selected.has(invoice.id) && invoice.status !== 'paid'
            ? { ...invoice, status: 'paid' }
            : invoice,
    );
}

export function invoicesToCsv(invoices: Invoice[]): string {
    const rows = invoices.map((invoice) => [
        invoice.number,
        invoice.customer,
        invoice.email,
        invoice.status,
        invoice.plan,
        invoice.amount,
        invoice.issued,
    ]);

    return [
        [
            'Invoice',
            'Customer',
            'Email',
            'Status',
            'Plan',
            'Amount (IDR)',
            'Issued',
        ],
        ...rows,
    ]
        .map((row) =>
            row
                .map((value) => {
                    const text = String(value);
                    const safe = /^[=+\-@\t\r\n]/.test(text)
                        ? `'${text}`
                        : text;
                    return `"${safe.replaceAll('"', '""')}"`;
                })
                .join(','),
        )
        .join('\r\n');
}
