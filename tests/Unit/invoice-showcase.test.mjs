import assert from 'node:assert/strict';
import test from 'node:test';
import {
    canUseBasicInvoiceFilters,
    filterInvoices,
    invoicesToCsv,
    markInvoicesPaid,
    sortInvoices,
} from '../../resources/js/lib/invoice-showcase.ts';

const invoices = [
    {
        id: 'a',
        number: 'INV-001',
        customer: 'Nabila Rahma',
        email: 'nabila@example.test',
        status: 'paid',
        plan: 'Starter',
        amount: 0,
        issued: '2026-09-02',
    },
    {
        id: 'b',
        number: 'INV-002',
        customer: 'Farhan Pratama',
        email: 'farhan@example.test',
        status: 'pending',
        plan: 'Pro',
        amount: 250000,
        issued: '2026-10-03',
    },
    {
        id: 'c',
        number: 'INV-003',
        customer: 'Dewi Anggraini',
        email: '',
        status: 'overdue',
        plan: 'Business',
        amount: 500000,
        issued: '2026-11-04',
    },
];
const rule = (field, operator, value, negated = false) => ({
    id: field,
    type: 'rule',
    path: [field],
    operator,
    value,
    negated,
});
const group = (rules = [], combinator = 'and') => ({
    id: 'root',
    type: 'group',
    rules,
    combinator,
});
const ids = (query, search = '') =>
    filterInvoices(invoices, search, query).map((invoice) => invoice.id);

await test('basic filter chips are used only for flat AND queries', () => {
    assert.equal(canUseBasicInvoiceFilters(group()), true);
    assert.equal(
        canUseBasicInvoiceFilters(group([rule('status', 'is', 'paid')])),
        true,
    );
    assert.equal(
        canUseBasicInvoiceFilters(group([rule('status', 'is', 'paid')], 'or')),
        false,
    );
    assert.equal(
        canUseBasicInvoiceFilters(
            group([group([rule('status', 'is', 'paid')])]),
        ),
        false,
    );
});

await test('search matches invoice ID, name, email, and plan without case or whitespace surprises', () => {
    assert.deepEqual(ids(group(), ' NABILA@EXAMPLE '), ['a']);
    assert.deepEqual(ids(group(), 'inv-002'), ['b']);
    assert.deepEqual(ids(group(), 'dewi'), ['c']);
    assert.deepEqual(ids(group(), 'business'), ['c']);
});

await test('search and filters are applied together', () => {
    assert.deepEqual(ids(group([rule('status', 'is', 'paid')]), 'farhan'), []);
});

await test('status sets and inverse operators select the expected invoices', () => {
    assert.deepEqual(
        ids(group([rule('status', 'is_any_of', ['pending', 'overdue'])])),
        ['b', 'c'],
    );
    assert.deepEqual(
        ids(group([rule('status', 'is_none_of', ['pending', 'overdue'])])),
        ['a'],
    );
    assert.deepEqual(ids(group([rule('status', 'is_not', 'paid')])), [
        'b',
        'c',
    ]);
});

await test('nested AND and OR groups preserve their meaning and ignore incomplete drafts', () => {
    const query = group([
        group(
            [rule('status', 'is', 'paid'), rule('plan', 'is', 'Business')],
            'or',
        ),
        rule('amount', 'gte', 250000),
        group([rule('customer', '', undefined)]),
    ]);
    assert.deepEqual(ids(query), ['c']);
    assert.deepEqual(
        ids(
            group(
                [
                    rule('status', 'is', undefined),
                    rule('status', 'is', 'pending'),
                ],
                'or',
            ),
        ),
        ['b'],
    );
});

await test('text operators and explicit negation work on customer names and dates', () => {
    assert.deepEqual(ids(group([rule('customer', 'contains', 'rahma')])), [
        'a',
    ]);
    assert.deepEqual(ids(group([rule('customer', 'not_contains', 'rahma')])), [
        'b',
        'c',
    ]);
    assert.deepEqual(ids(group([rule('issued', 'starts_with', '2026-10')])), [
        'b',
    ]);
    assert.deepEqual(ids(group([rule('customer', 'ends_with', 'ma')])), [
        'a',
        'b',
    ]);
    assert.deepEqual(
        ids(group([rule('issued', 'starts_with', '2026-10', true)])),
        ['a', 'c'],
    );
});

await test('numeric filters include zero and range boundaries', () => {
    for (const [operator, value, expected] of [
        ['eq', 0, ['a']],
        ['neq', 0, ['b', 'c']],
        ['gt', 250000, ['c']],
        ['gte', 250000, ['b', 'c']],
        ['lt', 250000, ['a']],
        ['lte', 250000, ['a', 'b']],
        ['between', [500000, 250000], ['b', 'c']],
        ['not_between', [250000, 500000], ['a']],
    ]) {
        assert.deepEqual(
            ids(group([rule('amount', operator, value)])),
            expected,
            operator,
        );
    }
});

await test('empty operators work without a value and invalid drafts do not remove records', () => {
    assert.deepEqual(ids(group([rule('email', 'empty')])), ['c']);
    assert.deepEqual(ids(group([rule('email', 'not_empty')])), ['a', 'b']);
    assert.deepEqual(ids(group([rule('amount', 'not_empty')])), [
        'a',
        'b',
        'c',
    ]);
    for (const draft of [
        rule('amount', 'gt', ''),
        rule('amount', 'gt', 'invalid'),
        rule('amount', 'between', [250000]),
        rule('status', 'is_any_of', []),
        rule('missing', 'is', 'x'),
    ]) {
        assert.deepEqual(ids(group([draft])), ['a', 'b', 'c']);
    }
});

await test('bulk payment changes only selected invoices and preserves the original records', () => {
    const updated = markInvoicesPaid(invoices, ['b']);
    assert.equal(updated[1].status, 'paid');
    assert.equal(updated[2].status, 'overdue');
    assert.equal(invoices[1].status, 'pending');
    assert.equal(updated[0], invoices[0]);
});

await test('CSV includes exactly the chosen records and escapes spreadsheet content', () => {
    const csv = invoicesToCsv([
        { ...invoices[1], customer: '=SUM(1,2)', email: 'a"b@example.test' },
    ]);
    assert.equal(
        csv,
        '"Invoice","Customer","Email","Status","Plan","Amount (IDR)","Issued"\r\n"INV-002","\'=SUM(1,2)","a""b@example.test","pending","Pro","250000","2026-10-03"',
    );
    assert.equal(csv.includes('INV-001'), false);
});

await test('sorting orders the ledger by the requested key and direction without mutating the input', () => {
    const sortedIds = (sorting) =>
        sortInvoices(invoices, sorting).map((invoice) => invoice.id);

    assert.deepEqual(sortedIds([{ id: 'amount', desc: true }]), [
        'c',
        'b',
        'a',
    ]);
    assert.deepEqual(sortedIds([{ id: 'amount', desc: false }]), [
        'a',
        'b',
        'c',
    ]);
    assert.deepEqual(sortedIds([{ id: 'issued', desc: false }]), [
        'a',
        'b',
        'c',
    ]);
    assert.deepEqual(
        invoices.map((invoice) => invoice.id),
        ['a', 'b', 'c'],
    );
});

await test('later sort keys break ties and columns the grid cannot sort are ignored', () => {
    const tied = [
        { ...invoices[0], id: 'x', amount: 100 },
        { ...invoices[0], id: 'y', amount: 300 },
        { ...invoices[0], id: 'z', amount: 200 },
    ];

    assert.deepEqual(
        sortInvoices(tied, [
            { id: 'status', desc: false },
            { id: 'amount', desc: true },
        ]).map((invoice) => invoice.id),
        ['y', 'z', 'x'],
    );
    assert.deepEqual(
        sortInvoices(tied, [{ id: 'select', desc: true }]).map(
            (invoice) => invoice.id,
        ),
        ['x', 'y', 'z'],
    );
});
