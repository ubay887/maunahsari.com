'use no memo';

import { Deferred, Head, router } from '@inertiajs/react';
import {
    useTable,
    type ColumnDef,
    type RowSelectionState,
    type SortingState,
    type ColumnVisibilityState,
} from '@tanstack/react-table';
import {
    CheckCheck,
    Columns3,
    Copy,
    Download,
    Ellipsis,
    Eye,
    ReceiptText,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import {
    DataGrid,
    dataGridFeatures,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { DataGridSelectionBar } from '@/components/reui/data-grid/data-grid-cell-selection';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/reui/data-grid/data-grid-column-visibility';
import { DataGridScrollArea } from '@/components/reui/data-grid/data-grid-scroll-area';
import {
    DataGridTableRowSelect,
    DataGridTableRowSelectAll,
} from '@/components/reui/data-grid/data-grid-table';
import { DataGridTableVirtual } from '@/components/reui/data-grid/data-grid-table-virtual';
import { Filters } from '@/components/reui/filters/filters';
import { createFilterQuery } from '@/components/reui/filters/filters-query';
import type {
    FilterField,
    FilterQuery,
} from '@/components/reui/filters/filters-types';
import {
    Frame,
    FrameFooter,
    FrameHeader,
    FramePanel,
} from '@/components/reui/frame';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    canUseBasicInvoiceFilters,
    filterInvoices,
    invoicesToCsv,
    markInvoicesPaid,
    sortInvoices,
    type Invoice,
    type InvoiceStatus,
} from '@/lib/invoice-showcase';
import { dataGrid } from '@/routes/showcase';

type PreviewState = 'ready' | 'loading' | 'empty' | 'error';
const PAGE_SIZE = 20;
const FETCH_DELAY_MS = 400;
// The virtualizer spaces rows from this estimate, so it stays equal to the
// rendered row height in each density.
const rowEstimatePx = { compact: 41, comfortable: 55 } as const;
const initialSorting: SortingState = [{ id: 'issued', desc: true }];
const money = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
});
const statusLabels: Record<InvoiceStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
};
const statusVariants = {
    paid: 'success-light',
    pending: 'warning-light',
    overdue: 'destructive-light',
} as const;
const fields: FilterField[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
        })),
    },
    {
        id: 'plan',
        label: 'Plan',
        type: 'select',
        options: ['Starter', 'Pro', 'Business'].map((value) => ({
            value,
            label: value,
        })),
    },
    {
        id: 'customer',
        label: 'Customer',
        type: 'text',
        placeholder: 'Customer name',
    },
    {
        id: 'amount',
        label: 'Amount (IDR)',
        type: 'number',
        placeholder: 'Amount in rupiah',
    },
    {
        id: 'issued',
        label: 'Issued date',
        type: 'text',
        placeholder: 'YYYY-MM-DD or YYYY-MM',
    },
];

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('');
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
    return (
        <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
    );
}

async function copyInvoiceNumber(number: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(number);
        toast.success('Invoice ID copied');
    } catch {
        toast.error('Unable to copy', {
            description: 'Select and copy the invoice ID manually.',
        });
    }
}

function InvoiceGrid({
    initialInvoices,
    loadStatus,
    retrying = false,
    onRetry,
}: {
    initialInvoices: Invoice[];
    loadStatus?: 'loading' | 'error';
    retrying?: boolean;
    onRetry?: () => void;
}) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState<FilterQuery>(() => createFilterQuery());
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    // The virtual table latches its fetch trigger per row count, so a window
    // reset has to remount it, or a repeat of an earlier count never loads
    // again. `resetWindow` bumps the key it remounts on.
    const [gridKey, setGridKey] = useState(0);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>({});
    const [density, setDensity] = useState('compact');
    const [striped, setStriped] = useState(false);
    const [cellBorders, setCellBorders] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState(false);
    const [preview, setPreview] = useState<PreviewState>('ready');
    const [detailId, setDetailId] = useState<string | null>(null);
    const state = loadStatus ?? preview;
    const isLoading = state === 'loading';
    const hasError = state === 'error';
    const unavailable = isLoading || hasError;
    const fetchTimer = useRef<number | null>(null);
    const filteredInvoices = useMemo(
        () =>
            state === 'empty' || hasError
                ? []
                : filterInvoices(invoices, search, query),
        [state, hasError, invoices, search, query],
    );
    // The whole filtered ledger is ordered before it is cut to the loaded
    // window, so every batch of an infinite scroll comes from one order.
    const orderedInvoices = useMemo(
        () => sortInvoices(filteredInvoices, sorting),
        [filteredInvoices, sorting],
    );
    const visibleInvoices = useMemo(
        () => orderedInvoices.slice(0, loadedCount),
        [orderedInvoices, loadedCount],
    );
    const selectedInvoices = useMemo(
        () => visibleInvoices.filter((invoice) => rowSelection[invoice.id]),
        [visibleInvoices, rowSelection],
    );
    const selectedTotal = selectedInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0,
    );
    const detail = invoices.find((invoice) => invoice.id === detailId);
    const total = useMemo(
        () => orderedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
        [orderedInvoices],
    );
    const hasMore = loadedCount < orderedInvoices.length;
    const rowHeight =
        density === 'compact'
            ? rowEstimatePx.compact
            : rowEstimatePx.comfortable;

    const clearFetchTimer = useCallback(() => {
        if (fetchTimer.current !== null) {
            window.clearTimeout(fetchTimer.current);
            fetchTimer.current = null;
        }
        setIsFetchingMore(false);
    }, []);

    const resetWindow = useCallback(() => {
        clearFetchTimer();
        setLoadedCount(PAGE_SIZE);
        setGridKey((key) => key + 1);
    }, [clearFetchTimer]);

    const loadMore = useCallback(() => {
        if (isFetchingMore || loadedCount >= orderedInvoices.length) {
            return;
        }

        setIsFetchingMore(true);
        fetchTimer.current = window.setTimeout(() => {
            fetchTimer.current = null;
            setLoadedCount((current) => current + PAGE_SIZE);
            setIsFetchingMore(false);
        }, FETCH_DELAY_MS);
    }, [isFetchingMore, loadedCount, orderedInvoices.length]);

    useEffect(
        () => () => {
            if (fetchTimer.current !== null) {
                window.clearTimeout(fetchTimer.current);
            }
        },
        [],
    );

    function resetFilters() {
        setSearch('');
        setQuery(createFilterQuery());
        resetWindow();
        setRowSelection({});
        setPreview('ready');
    }

    const markPaid = useCallback(
        (ids: string[]) => {
            const count = invoices.filter(
                (invoice) =>
                    ids.includes(invoice.id) && invoice.status !== 'paid',
            ).length;
            setInvoices((current) => markInvoicesPaid(current, ids));
            setRowSelection({});
            toast.success(
                count
                    ? `${count} invoice${count === 1 ? '' : 's'} marked paid`
                    : 'Already paid',
            );
        },
        [invoices],
    );

    const columns = useMemo<ColumnDef<DataGridFeatures, Invoice>[]>(
        () => [
            {
                id: 'select',
                header: () => <DataGridTableRowSelectAll />,
                cell: ({ row }) => <DataGridTableRowSelect row={row} />,
                size: 40,
                minSize: 40,
                maxSize: 40,
                enableSorting: false,
                enableResizing: false,
                enableHiding: false,
                enablePinning: false,
            },
            {
                accessorKey: 'number',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Invoice" />
                ),
                cell: ({ row }) => (
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => setDetailId(row.original.id)}
                    >
                        {row.original.number}
                    </Button>
                ),
                size: 165,
                minSize: 145,
                enableHiding: false,
                meta: {
                    headerTitle: 'Invoice',
                },
            },
            {
                accessorKey: 'customer',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Customer" />
                ),
                cell: ({ row }) => (
                    <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-7">
                            <AvatarFallback>
                                {initials(row.original.customer)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <span
                                className="truncate font-medium"
                                title={row.original.email}
                            >
                                {row.original.customer}
                            </span>
                            <span
                                className={
                                    density === 'compact'
                                        ? 'sr-only'
                                        : 'truncate text-xs text-muted-foreground'
                                }
                            >
                                {row.original.email}
                            </span>
                        </div>
                    </div>
                ),
                size: 235,
                minSize: 180,
                meta: {
                    headerTitle: 'Customer',
                    fillWidth: true,
                },
            },
            {
                accessorKey: 'status',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => (
                    <InvoiceStatusBadge status={row.original.status} />
                ),
                size: 115,
                minSize: 105,
                meta: {
                    headerTitle: 'Status',
                },
            },
            {
                accessorKey: 'plan',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Plan" />
                ),
                size: 110,
                minSize: 90,
                meta: {
                    headerTitle: 'Plan',
                },
            },
            {
                accessorKey: 'amount',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Amount" />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">
                        {money.format(row.original.amount)}
                    </span>
                ),
                size: 155,
                minSize: 130,
                meta: {
                    headerTitle: 'Amount',
                    headerClassName: 'text-end [&>div]:justify-end',
                    cellClassName: 'text-end tabular-nums',
                },
            },
            {
                accessorKey: 'issued',
                header: ({ column }) => (
                    <DataGridColumnHeader column={column} title="Issued" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground tabular-nums">
                        {date.format(
                            new Date(`${row.original.issued}T00:00:00Z`),
                        )}
                    </span>
                ),
                size: 145,
                minSize: 125,
                meta: {
                    headerTitle: 'Issued',
                },
            },
            {
                id: 'actions',
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`Actions for ${row.original.number}`}
                            >
                                <Ellipsis aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={() => setDetailId(row.original.id)}
                            >
                                <Eye aria-hidden />
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    void copyInvoiceNumber(row.original.number);
                                }}
                            >
                                <Copy aria-hidden />
                                Copy invoice ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={row.original.status === 'paid'}
                                onSelect={() => markPaid([row.original.id])}
                            >
                                <CheckCheck aria-hidden />
                                Mark as paid
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                size: 48,
                minSize: 48,
                maxSize: 48,
                enableSorting: false,
                enableHiding: false,
                enableResizing: false,
                enablePinning: false,
            },
        ],
        [density, markPaid],
    );

    const table = useTable({
        features: dataGridFeatures,
        data: visibleInvoices,
        columns,
        getRowId: (invoice: Invoice) => invoice.id,
        defaultColumn: { minSize: 80, maxSize: 520 },
        // The grid grows its own window through `onFetchMore`, so the
        // paginated row model must hand over every row it is given.
        manualPagination: true,
        state: { sorting, rowSelection, columnVisibility },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        enableRowSelection: !unavailable,
    });

    function resetDemo() {
        setInvoices(initialInvoices);
        resetFilters();
        setSorting(initialSorting);
        setColumnVisibility({});
        setDensity('compact');
        setStriped(false);
        setCellBorders(false);
        setAdvancedFilters(false);
        table.resetColumnPinning();
        table.resetColumnOrder();
        table.resetColumnSizing();
        toast.info('Demo reset');
    }

    function exportInvoices() {
        const rows =
            selectedInvoices.length > 0 ? selectedInvoices : orderedInvoices;
        const url = URL.createObjectURL(
            new Blob(['\uFEFF', invoicesToCsv(rows)], {
                type: 'text/csv;charset=utf-8;',
            }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedInvoices.length
            ? 'selected-invoices.csv'
            : 'invoices.csv';
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`${rows.length} invoices exported`);
    }

    function changeQuery(next: FilterQuery) {
        setQuery(next);
        resetWindow();
        setRowSelection({});
    }

    const emptyMessage = hasError ? (
        <div className="mx-auto w-full max-w-md text-start">
            <Alert variant="destructive">
                <AlertTitle>Unable to load invoices</AlertTitle>
                <AlertDescription>
                    <p>Please try loading the data again.</p>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={retrying}
                        onClick={onRetry ?? (() => setPreview('ready'))}
                    >
                        <RefreshCw aria-hidden />
                        {retrying ? 'Retrying…' : 'Retry'}
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    ) : (
        <div role="status" className="flex flex-col items-center gap-3">
            <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">No invoices found</p>
                <p className="text-sm text-muted-foreground">
                    Try another search or clear the filters.
                </p>
            </div>
            <Button type="button" variant="outline" onClick={resetFilters}>
                <RefreshCw aria-hidden />
                Reset filters
            </Button>
        </div>
    );

    return (
        <>
            <DataGrid
                table={table}
                recordCount={orderedInvoices.length}
                isLoading={isLoading}
                loadingMode="spinner"
                loadingMessage="Loading invoices…"
                fetchingMoreMessage="Loading more invoices…"
                allRowsLoadedMessage="All invoices loaded"
                emptyMessage={emptyMessage}
                tableLayout={{
                    dense: density === 'compact',
                    stripped: striped,
                    cellBorder: cellBorders,
                    headerSticky: true,
                    columnsResizable: true,
                    columnsPinnable: true,
                    columnsMovable: true,
                    columnsVisibility: true,
                }}
                tableClassNames={{
                    base: 'min-w-[960px]',
                    // The sticky band needs its own opaque surface: rows scroll
                    // under it, and z-40 keeps the pinned body cells (z-30)
                    // from painting over it.
                    headerSticky: 'sticky top-0 z-40 bg-muted',
                }}
            >
                <Frame spacing="default" className="min-w-0">
                    <FrameHeader className="gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <ReceiptText
                                    aria-hidden
                                    className="size-4 text-muted-foreground"
                                />
                                <span className="text-sm font-medium">
                                    Invoice ledger
                                </span>
                                <Badge variant="secondary" size="sm">
                                    {visibleInvoices.length} /{' '}
                                    {orderedInvoices.length}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <DataGridColumnVisibility
                                    table={table}
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={unavailable}
                                        >
                                            <Columns3 aria-hidden />
                                            Columns
                                        </Button>
                                    }
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={unavailable}
                                        >
                                            <SlidersHorizontal aria-hidden />
                                            View
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="end"
                                        className="w-72"
                                    >
                                        <FieldGroup className="gap-4">
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldLabel htmlFor="grid-compact-rows">
                                                        Compact rows
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Tighter padding for a
                                                        long ledger.
                                                    </FieldDescription>
                                                </FieldContent>
                                                <Switch
                                                    id="grid-compact-rows"
                                                    size="sm"
                                                    checked={
                                                        density === 'compact'
                                                    }
                                                    disabled={unavailable}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setDensity(
                                                            checked
                                                                ? 'compact'
                                                                : 'comfortable',
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldLabel htmlFor="grid-striped-rows">
                                                        Striped rows
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Zebra striping across
                                                        the body.
                                                    </FieldDescription>
                                                </FieldContent>
                                                <Switch
                                                    id="grid-striped-rows"
                                                    size="sm"
                                                    checked={striped}
                                                    disabled={unavailable}
                                                    onCheckedChange={setStriped}
                                                />
                                            </Field>
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldLabel htmlFor="grid-cell-borders">
                                                        Cell borders
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Vertical rules between
                                                        columns.
                                                    </FieldDescription>
                                                </FieldContent>
                                                <Switch
                                                    id="grid-cell-borders"
                                                    size="sm"
                                                    checked={cellBorders}
                                                    disabled={unavailable}
                                                    onCheckedChange={
                                                        setCellBorders
                                                    }
                                                />
                                            </Field>
                                            <FieldSeparator />
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldLabel htmlFor="grid-preview-state">
                                                        Preview state
                                                    </FieldLabel>
                                                    <FieldDescription>
                                                        Demo-only loading, empty
                                                        and error views.
                                                    </FieldDescription>
                                                </FieldContent>
                                                <Select
                                                    value={preview}
                                                    disabled={unavailable}
                                                    onValueChange={(value) => {
                                                        setPreview(
                                                            value as PreviewState,
                                                        );
                                                        resetWindow();
                                                        setRowSelection({});
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="grid-preview-state"
                                                        size="sm"
                                                        className="w-28"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ready">
                                                            Data
                                                        </SelectItem>
                                                        <SelectItem value="loading">
                                                            Loading
                                                        </SelectItem>
                                                        <SelectItem value="empty">
                                                            Empty
                                                        </SelectItem>
                                                        <SelectItem value="error">
                                                            Error
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                            <FieldSeparator />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetDemo}
                                            >
                                                <RefreshCw aria-hidden />
                                                Reset demo
                                            </Button>
                                        </FieldGroup>
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    type="button"
                                    disabled={
                                        unavailable ||
                                        visibleInvoices.length === 0
                                    }
                                    onClick={exportInvoices}
                                >
                                    <Download aria-hidden />
                                    {selectedInvoices.length
                                        ? 'Export selected'
                                        : 'Export'}
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <InputGroup className="w-full sm:w-72">
                                <InputGroupAddon>
                                    <Search aria-hidden />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="search"
                                    value={search}
                                    disabled={unavailable}
                                    aria-label="Search invoices"
                                    placeholder="Search invoice, customer, email…"
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        resetWindow();
                                        setRowSelection({});
                                    }}
                                />
                                {search !== '' && (
                                    <InputGroupAddon align="inline-end">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <InputGroupButton
                                                    size="icon-xs"
                                                    aria-label="Clear search"
                                                    onClick={() => {
                                                        setSearch('');
                                                        resetWindow();
                                                        setRowSelection({});
                                                    }}
                                                >
                                                    <X aria-hidden />
                                                </InputGroupButton>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear search
                                            </TooltipContent>
                                        </Tooltip>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                            <Filters
                                fields={fields}
                                size="sm"
                                variant={advancedFilters ? 'advanced' : 'basic'}
                                query={query}
                                onQueryChange={changeQuery}
                                onConvertToAdvanced={() =>
                                    setAdvancedFilters(true)
                                }
                                showClear
                                disabled={unavailable}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={
                                    unavailable ||
                                    (advancedFilters &&
                                        !canUseBasicInvoiceFilters(query))
                                }
                                title={
                                    advancedFilters &&
                                    !canUseBasicInvoiceFilters(query)
                                        ? 'Nested or OR filters use the advanced editor.'
                                        : undefined
                                }
                                onClick={() =>
                                    setAdvancedFilters((current) => !current)
                                }
                            >
                                {advancedFilters ? 'Basic filters' : 'Advanced'}
                            </Button>
                        </div>
                    </FrameHeader>
                    <FramePanel className="flex min-h-0 flex-col p-0">
                        <div
                            className="flex min-h-0 flex-col"
                            aria-busy={isLoading}
                        >
                            <DataGridScrollArea
                                key={gridKey}
                                orientation="both"
                                className="h-[28rem] min-h-0"
                            >
                                <DataGridTableVirtual
                                    estimateSize={rowHeight}
                                    overscan={12}
                                    fetchMoreOffset={8}
                                    onFetchMore={loadMore}
                                    isFetchingMore={isFetchingMore}
                                    hasMore={hasMore}
                                />
                            </DataGridScrollArea>
                        </div>
                    </FramePanel>
                    <FrameFooter>
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                        >
                            <span>
                                {isLoading
                                    ? 'Loading invoices…'
                                    : hasError
                                      ? 'Invoice data unavailable'
                                      : 'Total'}
                            </span>
                            {!unavailable && (
                                <span className="tabular-nums">
                                    {money.format(total)}
                                </span>
                            )}
                        </div>
                    </FrameFooter>
                </Frame>

                <DataGridSelectionBar
                    label={(count) =>
                        `${count} selected · ${money.format(selectedTotal)}`
                    }
                >
                    <Button
                        type="button"
                        variant="outline"
                        disabled={unavailable}
                        onClick={() =>
                            markPaid(
                                selectedInvoices.map((invoice) => invoice.id),
                            )
                        }
                    >
                        <CheckCheck aria-hidden />
                        Mark paid
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={unavailable}
                        onClick={exportInvoices}
                    >
                        <Download aria-hidden />
                        Export selected
                    </Button>
                </DataGridSelectionBar>
            </DataGrid>

            <Dialog
                open={detail !== undefined}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailId(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {detail?.number ?? 'Invoice details'}
                        </DialogTitle>
                        <DialogDescription>
                            Demo changes reset when this page is reloaded.
                        </DialogDescription>
                    </DialogHeader>
                    {detail && (
                        <div className="flex flex-col gap-6">
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Customer
                                    </dt>
                                    <dd className="font-medium">
                                        {detail.customer}
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Amount
                                    </dt>
                                    <dd className="font-semibold tabular-nums">
                                        {money.format(detail.amount)}
                                    </dd>
                                </div>
                                <div className="col-span-2 flex flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Email
                                    </dt>
                                    <dd>{detail.email}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Plan
                                    </dt>
                                    <dd>{detail.plan}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Issued
                                    </dt>
                                    <dd>
                                        {date.format(
                                            new Date(
                                                `${detail.issued}T00:00:00Z`,
                                            ),
                                        )}
                                    </dd>
                                </div>
                            </dl>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="invoice-status">Status</Label>
                                <Select
                                    value={detail.status}
                                    onValueChange={(value) => {
                                        setInvoices((current) =>
                                            current.map((invoice) =>
                                                invoice.id === detail.id
                                                    ? {
                                                          ...invoice,
                                                          status: value as InvoiceStatus,
                                                      }
                                                    : invoice,
                                            ),
                                        );
                                        toast.success('Invoice updated');
                                    }}
                                >
                                    <SelectTrigger
                                        id="invoice-status"
                                        size="sm"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statusLabels).map(
                                            ([value, label]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function DataGridShowcase({
    invoices,
}: {
    invoices?: Invoice[];
}) {
    return (
        <>
            <Head title="Data Grid showcase" />
            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Data Grid
                        </h1>
                        <Badge variant="outline">Showcase</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Search, filter, and manage 48 demo invoices. Rows are
                        virtualized and loaded as you scroll.
                    </p>
                </div>
                <Deferred
                    data="invoices"
                    fallback={
                        <InvoiceGrid
                            key="loading"
                            initialInvoices={[]}
                            loadStatus="loading"
                        />
                    }
                    rescue={({ reloading }) => (
                        <InvoiceGrid
                            key="error"
                            initialInvoices={[]}
                            loadStatus="error"
                            retrying={reloading}
                            onRetry={() =>
                                router.reload({ only: ['invoices'] })
                            }
                        />
                    )}
                >
                    <InvoiceGrid key="data" initialInvoices={invoices ?? []} />
                </Deferred>
            </div>
        </>
    );
}

DataGridShowcase.layout = {
    breadcrumbs: [{ title: 'Data Grid', href: dataGrid() }],
};
