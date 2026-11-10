import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { SelectField } from '@/components/select-field';
import { Alert, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { regions } from '@/routes/psb';
import type { AddressData, AddressOptions, SelectOption } from '@/types/psb';

function RegionField({
    id,
    label,
    level,
    parentCode,
    value,
    onChange,
    error,
    initialOptions,
    placeholder,
}: {
    id: string;
    label: string;
    level: 'cities' | 'districts' | 'villages';
    parentCode: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    initialOptions?: SelectOption[];
    placeholder: string;
}) {
    const [options, setOptions] = useState(initialOptions ?? []);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
        parentCode && initialOptions === undefined ? 'loading' : 'ready',
    );
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!parentCode || (initialOptions !== undefined && attempt === 0))
            return;
        const controller = new AbortController();
        void fetch(regions.url({ query: { level, parent_code: parentCode } }), {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                if (!response.ok) throw new Error('Wilayah gagal dimuat');
                const data = (await response.json()) as {
                    options: SelectOption[];
                };
                if (!controller.signal.aborted) {
                    setOptions(data.options);
                    setStatus('ready');
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) setStatus('error');
            });
        return () => controller.abort();
    }, [level, parentCode, initialOptions, attempt]);

    function retry() {
        setStatus('loading');
        setAttempt((previous) => previous + 1);
    }

    if (status === 'loading')
        return (
            <Field>
                <FieldLabel>{label}</FieldLabel>
                <span role="status" className="text-xs text-muted-foreground">
                    Memuat pilihan wilayah…
                </span>
            </Field>
        );

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <SelectField
                id={id}
                label={label}
                value={value}
                options={options}
                onChange={onChange}
                error={error}
                disabled={
                    !parentCode || status === 'error' || options.length === 0
                }
                placeholder={parentCode ? 'Pilih…' : placeholder}
            />
            {(status === 'error' || (parentCode && options.length === 0)) && (
                <Alert variant={status === 'error' ? 'destructive' : 'info'}>
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                            {status === 'error'
                                ? 'Pilihan wilayah gagal dimuat.'
                                : 'Belum ada pilihan wilayah.'}
                        </span>
                        <Button type="button" variant="outline" onClick={retry}>
                            Coba lagi
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

export function AddressFields({
    data,
    errors,
    options,
    initialAddress,
    onChange,
}: {
    data: AddressData;
    errors: Partial<Record<keyof AddressData, string>>;
    options: AddressOptions;
    initialAddress?: Partial<AddressData>;
    onChange: (changes: Partial<AddressData>) => void;
}) {
    return (
        <>
            <div className="col-span-full grid min-w-0 gap-4 md:grid-cols-2">
                <SelectField
                    id="province_code"
                    label="Provinsi"
                    value={data.province_code}
                    options={options.provinces}
                    onChange={(value) =>
                        onChange({
                            province_code: value,
                            city_code: '',
                            district_code: '',
                            village_code: '',
                        })
                    }
                    error={errors.province_code}
                />
                <RegionField
                    key={`cities-${data.province_code}`}
                    id="city_code"
                    label="Kabupaten / kota"
                    level="cities"
                    parentCode={data.province_code}
                    value={data.city_code}
                    onChange={(value) =>
                        onChange({
                            city_code: value,
                            district_code: '',
                            village_code: '',
                        })
                    }
                    error={errors.city_code}
                    initialOptions={
                        data.province_code === initialAddress?.province_code
                            ? options.cities
                            : undefined
                    }
                    placeholder="Pilih provinsi dahulu"
                />
                <RegionField
                    key={`districts-${data.city_code}`}
                    id="district_code"
                    label="Kecamatan"
                    level="districts"
                    parentCode={data.city_code}
                    value={data.district_code}
                    onChange={(value) =>
                        onChange({ district_code: value, village_code: '' })
                    }
                    error={errors.district_code}
                    initialOptions={
                        data.city_code === initialAddress?.city_code
                            ? options.districts
                            : undefined
                    }
                    placeholder="Pilih kabupaten / kota dahulu"
                />
                <RegionField
                    key={`villages-${data.district_code}`}
                    id="village_code"
                    label="Desa / kelurahan"
                    level="villages"
                    parentCode={data.district_code}
                    value={data.village_code}
                    onChange={(value) => onChange({ village_code: value })}
                    error={errors.village_code}
                    initialOptions={
                        data.district_code === initialAddress?.district_code
                            ? options.villages
                            : undefined
                    }
                    placeholder="Pilih kecamatan dahulu"
                />
            </div>
            {options.provinces.length === 0 && (
                <Alert variant="warning" className="col-span-full">
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        <span>Pilihan provinsi belum tersedia.</span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.reload()}
                        >
                            Muat ulang
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <Field className="col-span-full min-w-0">
                <FieldLabel htmlFor="address">Detail alamat</FieldLabel>
                <Textarea
                    id="address"
                    rows={2}
                    value={data.address}
                    onChange={(event) =>
                        onChange({ address: event.target.value })
                    }
                    placeholder="Nama jalan, nomor rumah, dusun / lingkungan"
                    required
                    maxLength={5000}
                    aria-invalid={Boolean(errors.address)}
                />
                <InputError message={errors.address} />
            </Field>
            {(['rt', 'rw', 'postal_code'] as const).map((key) => (
                <Field
                    key={key}
                    className={
                        key === 'postal_code'
                            ? 'min-w-0 md:col-span-2 lg:col-span-1'
                            : 'min-w-0'
                    }
                >
                    <FieldLabel htmlFor={key}>
                        {key === 'postal_code'
                            ? 'Kode pos (opsional)'
                            : `${key.toUpperCase()} (opsional)`}
                    </FieldLabel>
                    <Input
                        id={key}
                        value={data[key]}
                        inputMode="numeric"
                        maxLength={key === 'postal_code' ? 5 : 3}
                        pattern={
                            key === 'postal_code' ? '[0-9]{5}' : '[0-9]{1,3}'
                        }
                        onChange={(event) =>
                            onChange({ [key]: event.target.value })
                        }
                        aria-invalid={Boolean(errors[key])}
                    />
                    <InputError message={errors[key]} />
                </Field>
            ))}
        </>
    );
}
