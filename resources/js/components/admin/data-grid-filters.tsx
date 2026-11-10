import { RotateCcw } from 'lucide-react';
import { Filters } from '@/components/reui/filters/filters';
import type { FiltersProps } from '@/components/reui/filters/filters';
import { Button } from '@/components/ui/button';

/**
 * The one filter bar for table toolbars: the shared Indonesian wording and no
 * built-in "Clear" button. Clearing every filter is `DataGridResetButton`, so
 * every list resets the same way.
 */
export function DataGridFilters({
    noun,
    ...props
}: Omit<FiltersProps, 'labels' | 'showClear'> & {
    /** Lowercase noun used in the accessible name, e.g. "artikel". */
    noun: string;
}) {
    return (
        <Filters
            {...props}
            showClear={false}
            labels={{
                addFilter: 'Tambah filter',
                searchFields: 'Cari filter…',
                searchOperators: 'Cari kondisi…',
                searchOptions: 'Cari pilihan…',
                fieldsLabel: 'Pilihan filter',
                filtersLabel: `Filter ${noun}`,
                selectPlaceholder: 'Pilih…',
                selectCondition: 'Pilih kondisi',
                empty: 'Tidak ada pilihan',
                back: 'Kembali',
                clear: 'Hapus',
                clearAll: 'Hapus semua',
                apply: 'Terapkan',
                discard: 'Batalkan perubahan',
                remove: 'Hapus filter',
                duplicate: 'Duplikasikan',
                negate: 'Balik kondisi',
                where: 'Dengan',
                and: 'Dan',
                or: 'Atau',
                loading: 'Memuat…',
                error: 'Gagal memuat pilihan',
                retry: 'Coba lagi',
                chipMenu: (label) => `Opsi filter ${label}`,
                countAnnouncement: (count) => `${count} filter diterapkan`,
                resultsAnnouncement: (count) => `${count} pilihan ditemukan`,
                valueCount: (count) => `${count} dipilih`,
            }}
        />
    );
}

/**
 * Resets the search and every filter at once. Shown only while something is
 * applied or being drafted, so a clean toolbar stays quiet.
 */
export function DataGridResetButton({
    active,
    disabled = false,
    onReset,
}: {
    active: boolean;
    disabled?: boolean;
    onReset: () => void;
}) {
    if (!active) {
        return null;
    }

    return (
        <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={onReset}
        >
            <RotateCcw aria-hidden />
            Reset filter
        </Button>
    );
}
