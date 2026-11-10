import type { ColumnDef, Table } from '@tanstack/react-table';
import { Columns3 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/reui/badge';
import {
    DataGrid,
    type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import { DataGridColumnVisibility } from '@/components/reui/data-grid/data-grid-column-visibility';
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination';
import { DataGridScrollArea } from '@/components/reui/data-grid/data-grid-scroll-area';
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table';
import {
    Frame,
    FrameFooter,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';

export const DATA_GRID_PAGE_SIZES = [10, 25, 50];

/**
 * Gives every column the shared defaults: a menu title
 * taken from a plain-string header, and for the `actions` column the same
 * right-aligned, always-visible, unsortable behaviour in every list.
 * Anything a column sets itself in `meta` wins.
 */
export function withGridColumnDefaults<TData extends object>(
    columns: ColumnDef<DataGridFeatures, TData>[],
): ColumnDef<DataGridFeatures, TData>[] {
    return columns.map((column) => {
        const isActions = column.id === 'actions';

        return {
            ...column,
            ...(isActions ? { enableHiding: false, enableSorting: false } : {}),
            meta: {
                ...(typeof column.header === 'string'
                    ? { headerTitle: column.header }
                    : {}),
                ...(isActions
                    ? {
                          headerClassName: 'text-right',
                          cellClassName: 'whitespace-nowrap',
                      }
                    : {}),
                ...column.meta,
            },
        } as ColumnDef<DataGridFeatures, TData>;
    });
}

/**
 * The one table surface for every admin list: a Frame with a title row
 * (title, count, actions, column menu), an optional toolbar row, a flush
 * scrolling grid and pagination. Pages supply columns, data and the toolbar.
 */
export function AdminDataGrid<TData extends object>({
    table,
    recordCount,
    isLoading,
    noun,
    title,
    empty,
    actions,
    toolbar,
    minWidthClass = 'min-w-[720px]',
    columnVisibility = true,
    pageSizes = DATA_GRID_PAGE_SIZES,
    pagination = true,
}: {
    table: Table<DataGridFeatures, TData>;
    recordCount: number;
    isLoading: boolean;
    /** Lowercase singular noun used in pagination and loading labels. */
    noun: string;
    title: string;
    empty: ReactNode;
    actions?: ReactNode;
    toolbar?: ReactNode;
    /** A literal Tailwind class so the compiler can see it. */
    minWidthClass?: string;
    columnVisibility?: boolean;
    pageSizes?: number[];
    pagination?: boolean;
}) {
    return (
        <DataGrid
            table={table}
            recordCount={recordCount}
            isLoading={isLoading}
            loadingMode="spinner"
            emptyMessage={empty}
            i18n={{
                labels: {
                    toggleColumns: 'Tampilkan kolom',
                    columnsMenu: 'Kolom',
                    sortAscending: 'Urutkan naik',
                    sortDescending: 'Urutkan turun',
                    rowsPerPage: 'Baris per halaman',
                    paginationInfo: ({ from, to, count }) =>
                        `${from}–${to} dari ${count} ${noun}`,
                    previousPage: 'Halaman sebelumnya',
                    nextPage: 'Halaman berikutnya',
                    goToPage: (pageNumber) => `Ke halaman ${pageNumber}`,
                    loading: `Memuat ${noun}…`,
                },
            }}
            tableLayout={{
                dense: true,
                headerSticky: true,
            }}
            tableClassNames={{
                base: minWidthClass,
                headerSticky: 'sticky top-0 z-40 bg-muted',
            }}
        >
            <Frame spacing="sm" className="min-w-0">
                <FrameHeader className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <FrameTitle>{title}</FrameTitle>
                            <Badge variant="outline" className="tabular-nums">
                                {recordCount.toLocaleString('id-ID')} {noun}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {actions}
                            {columnVisibility && (
                                <DataGridColumnVisibility
                                    table={table}
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isLoading}
                                        >
                                            <Columns3 aria-hidden />
                                            Kolom
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                    {toolbar && (
                        <div className="flex flex-wrap items-center gap-2">
                            {toolbar}
                        </div>
                    )}
                </FrameHeader>
                <FramePanel className="flex min-h-0 flex-col p-0">
                    <div
                        className="flex min-h-0 flex-col"
                        aria-busy={isLoading}
                    >
                        <DataGridScrollArea
                            orientation="both"
                            className="max-h-[36rem] min-h-0 [&>[data-slot=scroll-area-viewport]]:max-h-[inherit] [&_[data-slot=scroll-area-content]]:pb-3"
                        >
                            <DataGridTable />
                        </DataGridScrollArea>
                    </div>
                </FramePanel>
                {pagination && (
                    <FrameFooter>
                        <DataGridPagination sizes={pageSizes} />
                    </FrameFooter>
                )}
            </Frame>
        </DataGrid>
    );
}
