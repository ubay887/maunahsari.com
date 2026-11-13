import {
    createFilterQuery,
    flattenFilterConditions,
} from '@/components/reui/filters/filters-query';
import type { FilterField } from '@/components/reui/filters/filters-types';
import type { FilterQuery } from '@/components/reui/filters/filters-types';
import { useState } from 'react';
import {
    DataGridFilters,
    DataGridResetButton,
} from '@/components/admin/data-grid-filters';
import { DataGridSearch } from '@/components/admin/data-grid-search';
import { alumniLabels, openToOptions } from '@/lib/alumni';
import type { AlumniOptions } from '@/types/alumni';
export function AlumniFilterBar({
    filters,
    options,
    onApply,
    admin = false,
    radarMode = false,
}: {
    filters: Record<string, string>;
    options: AlumniOptions;
    onApply: (next: Record<string, string>) => void;
    admin?: boolean;
    radarMode?: boolean;
}) {
    const [draft, setDraft] = useState<FilterQuery | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const config = [
        { id: 'angkatan', label: 'Angkatan', type: 'text' as const },
        {
            id: 'pondok',
            label: 'Pondok',
            type: 'select' as const,
            options: [
                { value: 'putra', label: 'Putra' },
                { value: 'putri', label: 'Putri' },
            ],
        },
        {
            id: 'province_id',
            label: 'Provinsi',
            type: 'select' as const,
            options: options.provinces.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        },
        {
            id: 'regency_id',
            label: 'Kota/kabupaten',
            type: 'select' as const,
            options: options.regencies
                .filter(
                    (item) =>
                        !filters.province_id ||
                        String(item.province_id) === filters.province_id,
                )
                .map((item) => ({ value: String(item.id), label: item.name })),
        },
        { id: 'profession', label: 'Profesi', type: 'text' as const },
        {
            id: 'program_id',
            label: 'Program',
            type: 'select' as const,
            options: options.programs.map((item) => ({
                value: String(item.id),
                label: item.name,
            })),
        },
        {
            id: 'open_to',
            label: 'Kesediaan',
            type: 'select' as const,
            options: openToOptions.map((value) => ({
                value,
                label: alumniLabels[value],
            })),
        },
        ...(admin
            ? [
                  {
                      id: 'verification_status',
                      label: 'Verifikasi',
                      type: 'select' as const,
                      options: ['pending', 'approved', 'rejected'].map(
                          (value) => ({ value, label: alumniLabels[value] }),
                      ),
                  },
                  {
                      id: 'source',
                      label: 'Sumber',
                      type: 'select' as const,
                      options: ['self', 'admin', 'import'].map((value) => ({
                          value,
                          label: value,
                      })),
                  },
              ]
            : []),
    ];
    const availableConfig = config.filter(
        (field) =>
            !radarMode ||
            ['angkatan', 'profession', 'open_to'].includes(field.id),
    );
    const fields: FilterField[] = availableConfig.map((field) => ({
        ...field,
        operators: [{ value: 'is', label: 'adalah' }],
    }));
    const query = createFilterQuery(
        availableConfig
            .filter((field) => filters[field.id])
            .map((field) => ({
                id: field.id,
                type: 'rule' as const,
                path: [field.id],
                operator: 'is',
                value: filters[field.id],
            })),
    );
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
            <DataGridSearch
                label="Cari nama alumni"
                placeholder="Cari nama alumni…"
                value={search}
                onChange={setSearch}
                onSubmit={() => onApply({ ...filters, search })}
                onClear={() => {
                    setSearch('');
                    onApply({ ...filters, search: '' });
                }}
            />
            <DataGridFilters
                noun="alumni"
                fields={fields}
                query={draft ?? query}
                onBeforeQueryChange={(next) =>
                    next.combinator === 'and' &&
                    new Set(
                        next.rules.map((rule) =>
                            rule.type === 'rule' ? rule.path[0] : '',
                        ),
                    ).size === next.rules.length &&
                    next.rules.every(
                        (rule) =>
                            rule.type === 'rule' &&
                            !rule.negated &&
                            (!rule.operator || rule.operator === 'is'),
                    )
                }
                onQueryChange={(next) => {
                    setDraft(next);
                    if (
                        next.rules.some(
                            (rule) =>
                                rule.type !== 'rule' ||
                                !rule.operator ||
                                typeof rule.value !== 'string',
                        )
                    )
                        return;
                    const values: Record<string, string> = {};
                    for (const rule of flattenFilterConditions(next)) {
                        if (
                            rule.operator === 'is' &&
                            typeof rule.values[0] === 'string'
                        )
                            values[rule.field] = rule.values[0];
                    }
                    setDraft(null);
                    onApply({ ...values, search });
                }}
            />
            <DataGridResetButton
                active={
                    search !== '' ||
                    Object.keys(filters).length > 0 ||
                    Boolean(draft?.rules.length)
                }
                onReset={() => {
                    setSearch('');
                    setDraft(null);
                    onApply({});
                }}
            />
        </div>
    );
}
