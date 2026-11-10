import { Link } from '@inertiajs/react';
import { SelectField } from '@/components/select-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import InputError from '@/components/input-error';
import { alumniLabels } from '@/lib/alumni';
import { privacyPolicy } from '@/routes/alumni';
import type { PrivacyData } from '@/types/alumni';
export function PrivacyFields({
    data,
    setData,
    errors,
    fields,
}: {
    data: PrivacyData;
    setData: <K extends keyof PrivacyData>(
        key: K,
        value: PrivacyData[K],
    ) => void;
    errors: Partial<Record<keyof PrivacyData, string>>;
    fields: string[];
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-sm">
                <p>
                    <strong>Tampil:</strong> ikut peta agregat dan dapat
                    ditemukan jika direktori diizinkan.
                </p>
                <p>
                    <strong>Anonim:</strong> ikut hitungan peta, tanpa kartu
                    individu.
                </p>
                <p>
                    <strong>Sembunyi:</strong> tidak ikut peta, direktori, atau
                    radar.
                </p>
                <p>
                    WhatsApp dan email selalu memerlukan persetujuan permintaan
                    kontak.
                </p>
            </div>
            <SelectField
                label="Izin peta (wajib dipilih)"
                value={data.map_mode}
                onChange={(value) => setData('map_mode', value)}
                options={[
                    { value: 'visible', label: 'Tampil' },
                    { value: 'anonymous', label: 'Anonim' },
                    { value: 'hidden', label: 'Sembunyi' },
                ]}
                error={errors.map_mode}
            />
            <SelectField
                label="Izin direktori (wajib dipilih)"
                value={data.directory_visible}
                onChange={(value) => setData('directory_visible', value)}
                options={[
                    { value: '1', label: 'Izinkan tampil' },
                    { value: '0', label: 'Jangan tampilkan' },
                ]}
                error={errors.directory_visible}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                    <SelectField
                        key={field}
                        label={alumniLabels[field] ?? field}
                        value={data.field_visibility[field] ?? 'private'}
                        onChange={(value) =>
                            setData('field_visibility', {
                                ...data.field_visibility,
                                [field]: value,
                            })
                        }
                        options={[
                            { value: 'private', label: 'Privat' },
                            { value: 'alumni', label: 'Sesama alumni' },
                            { value: 'public', label: 'Publik' },
                        ]}
                    />
                ))}
            </div>
            <p className="text-sm text-muted-foreground">
                Level Publik mengizinkan penggunaan pada kartu yang diizinkan.
                Peta publik tetap hanya berupa angka agregat.
            </p>
            <InputError message={errors.field_visibility} />
            <Field>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="privacy-consent"
                        checked={data.privacy_consent}
                        onCheckedChange={(value) =>
                            setData('privacy_consent', value === true)
                        }
                    />
                    <FieldLabel htmlFor="privacy-consent">
                        Saya menyetujui Kebijakan Privasi versi{' '}
                        {data.privacy_version}
                    </FieldLabel>
                </div>
                <Link
                    href={privacyPolicy()}
                    className="text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Baca Kebijakan Privasi
                </Link>
                <InputError message={errors.privacy_consent} />
                <InputError message={errors.privacy_version} />
            </Field>
        </div>
    );
}
