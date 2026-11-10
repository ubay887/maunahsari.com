import { Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { AddressFields } from '@/components/psb/address-fields';
import { Contacts } from '@/components/psb/contacts';
import { SelectField } from '@/components/select-field';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldSet,
    FieldLegend,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { closedMessage, documentLabels, validateDocument } from '@/lib/psb';
import { cn } from '@/lib/utils';
import {
    store as offlineStore,
    update,
    index,
    show,
} from '@/routes/admin/psb/applicants';
import { register, store } from '@/routes/psb';
import { home as portalHome } from '@/routes/psb/portal';
import { update as portalUpdate } from '@/routes/psb/portal/profile';
import type {
    DocumentType,
    FormApplicant,
    FormOptions,
    Quota,
    AddressData,
} from '@/types/psb';
type ApplicationData = AddressData & {
    nik: string;
    registration_period_id: string;
    program_id: string;
    residence_type: string;
    full_name: string;
    nickname: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    address: string;
    last_education: string;
    hafalan_juz: string;
    can_read_binnadhor: boolean;
    can_write_pegon: boolean;
    guardian_name: string;
    guardian_relation: string;
    guardian_phone: string;
    agreed_to_rules: boolean;
    website: string;
    email: string;
    password: string;
    password_confirmation: string;
    documents: Record<DocumentType, File | null>;
};
function FormSection({
    title,
    publicForm,
    children,
    contentClassName,
}: {
    title: string;
    publicForm: boolean;
    children: ReactNode;
    contentClassName?: string;
}) {
    return publicForm ? (
        <Card className="min-w-0">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent
                className={cn(
                    'grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3',
                    contentClassName,
                )}
            >
                {children}
            </CardContent>
        </Card>
    ) : (
        <Frame spacing="default" className="min-w-0">
            <FrameHeader>
                <FrameTitle>{title}</FrameTitle>
            </FrameHeader>
            <FramePanel
                className={cn(
                    'grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3',
                    contentClassName,
                )}
            >
                {children}
            </FramePanel>
        </Frame>
    );
}
export function ApplicationForm({
    periods,
    programs,
    guardianRelations,
    educationLevels,
    addressOptions,
    applicant,
    mode,
    quotas = [],
    initialProgram = 0,
    initialGender = '',
}: FormOptions & {
    applicant?: FormApplicant;
    /** `portal`: calon santri mengubah biodata sendiri; program, periode, berkas, dan persetujuan tidak ditampilkan. */
    mode: 'public' | 'offline' | 'edit' | 'portal';
    quotas?: Quota[];
    initialProgram?: number;
    initialGender?: string;
}) {
    const publicForm = mode === 'public';
    const portalForm = mode === 'portal';
    const step = (number: number) =>
        portalForm && number > 3 ? number - 1 : number;
    const period = periods[0] ?? null;
    const form = useForm<ApplicationData>({
        registration_period_id: String(
            applicant?.registration_period_id ?? period?.id ?? '',
        ),
        program_id: String(applicant?.program_id ?? (initialProgram || '')),
        residence_type: applicant?.residence_type ?? 'mukim',
        full_name: applicant?.full_name ?? '',
        nickname: applicant?.nickname ?? '',
        nik: applicant?.nik ?? '',
        province_code: applicant?.province_code ?? '',
        city_code: applicant?.city_code ?? '',
        district_code: applicant?.district_code ?? '',
        village_code: applicant?.village_code ?? '',
        rt: applicant?.rt ?? '',
        rw: applicant?.rw ?? '',
        postal_code: applicant?.postal_code ?? '',
        gender: applicant?.gender ?? initialGender,
        birth_place: applicant?.birth_place ?? '',
        birth_date: applicant?.birth_date.slice(0, 10) ?? '',
        address: applicant?.address ?? '',
        last_education: applicant?.last_education ?? '',
        hafalan_juz: String(applicant?.hafalan_juz ?? ''),
        can_read_binnadhor: applicant?.can_read_binnadhor ?? false,
        can_write_pegon: applicant?.can_write_pegon ?? false,
        guardian_name: applicant?.guardian_name ?? '',
        guardian_relation: applicant?.guardian_relation ?? '',
        guardian_phone: applicant?.guardian_phone ?? '',
        agreed_to_rules: applicant?.agreed_to_rules ?? false,
        website: '',
        email: '',
        password: '',
        password_confirmation: '',
        documents: { ijazah: null, kartu_keluarga: null, pas_foto: null },
    });
    const selected = programs.find(
        (program) => String(program.id) === form.data.program_id,
    );
    const pondok = form.data.gender === 'male' ? 'putra' : 'putri';
    const unavailable =
        publicForm &&
        Boolean(form.data.gender && form.data.program_id) &&
        !quotas.some(
            (quota) =>
                String(quota.program_id) === form.data.program_id &&
                quota.pondok === pondok &&
                quota.available,
        );
    function submit(event: FormEvent) {
        event.preventDefault();
        form.submit(
            portalForm
                ? portalUpdate()
                : mode === 'edit' && applicant
                  ? update(applicant.id)
                  : publicForm
                    ? store()
                    : offlineStore(),
            {
                forceFormData: mode !== 'edit' && !portalForm,
                onError: (errors) =>
                    toast.error(
                        errors.status ?? 'Periksa kembali isian formulir.',
                    ),
                preserveScroll: true,
            },
        );
    }
    if (unavailable || form.errors.program_id === closedMessage)
        return (
            <Alert variant="warning">
                <AlertTitle>{closedMessage}</AlertTitle>
                <AlertDescription>
                    <div className="flex flex-col gap-4">
                        <Contacts period={period} />
                        <Button type="button" variant="outline" asChild>
                            <Link href={register()}>
                                Pilih program atau pondok lain
                            </Link>
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-4"
            aria-busy={form.processing}
        >
            <FormSection
                title="1. Identitas calon santri"
                publicForm={publicForm}
            >
                {(
                    [
                        ['full_name', 'Nama lengkap'],
                        ['nickname', 'Nama panggilan (opsional)'],
                    ] as const
                ).map(([field, label]) => (
                    <Field
                        key={field}
                        className={
                            field === 'full_name'
                                ? 'min-w-0 md:col-span-2 lg:col-span-1'
                                : 'min-w-0'
                        }
                    >
                        <FieldLabel htmlFor={field}>{label}</FieldLabel>
                        <Input
                            id={field}
                            value={form.data[field]}
                            onChange={(event) =>
                                form.setData(field, event.target.value)
                            }
                            required={field !== 'nickname'}
                            maxLength={255}
                            aria-invalid={Boolean(form.errors[field])}
                        />
                        <InputError message={form.errors[field]} />
                    </Field>
                ))}
                <Field className="min-w-0">
                    <FieldLabel htmlFor="nik">NIK calon santri</FieldLabel>
                    <Input
                        id="nik"
                        value={form.data.nik}
                        onChange={(event) =>
                            form.setData('nik', event.target.value)
                        }
                        inputMode="numeric"
                        minLength={16}
                        maxLength={16}
                        pattern="[0-9]{16}"
                        placeholder="16 digit sesuai Kartu Keluarga"
                        required
                        aria-invalid={Boolean(form.errors.nik)}
                    />
                    <InputError message={form.errors.nik} />
                </Field>
                <SelectField
                    id="gender"
                    label="Jenis kelamin"
                    value={form.data.gender}
                    options={[
                        { value: 'male', label: 'Laki-laki — Pondok putra' },
                        { value: 'female', label: 'Perempuan — Pondok putri' },
                    ]}
                    onChange={(value) => form.setData('gender', value)}
                    error={form.errors.gender}
                    disabled={mode === 'edit' || portalForm}
                />
                {(
                    [
                        ['birth_place', 'Tempat lahir'],
                        ['birth_date', 'Tanggal lahir'],
                    ] as const
                ).map(([field, label]) => (
                    <Field
                        key={field}
                        className={
                            field === 'birth_date'
                                ? 'min-w-0 md:col-span-2 lg:col-span-1'
                                : 'min-w-0'
                        }
                    >
                        <FieldLabel htmlFor={field}>{label}</FieldLabel>
                        <Input
                            id={field}
                            type={field === 'birth_date' ? 'date' : 'text'}
                            value={form.data[field]}
                            onChange={(event) =>
                                form.setData(field, event.target.value)
                            }
                            required
                            maxLength={255}
                            aria-invalid={Boolean(form.errors[field])}
                        />
                        <InputError message={form.errors[field]} />
                    </Field>
                ))}
            </FormSection>
            <FormSection title="2. Alamat domisili" publicForm={publicForm}>
                <AddressFields
                    data={form.data}
                    errors={form.errors}
                    options={addressOptions}
                    initialAddress={
                        applicant
                            ? {
                                  province_code: applicant.province_code ?? '',
                                  city_code: applicant.city_code ?? '',
                                  district_code: applicant.district_code ?? '',
                              }
                            : undefined
                    }
                    onChange={(changes) =>
                        form.setData({ ...form.data, ...changes })
                    }
                />
            </FormSection>
            {!portalForm && (
                <FormSection
                    title="3. Pilihan pendaftaran"
                    publicForm={publicForm}
                    contentClassName={
                        publicForm ? 'md:grid-cols-2 lg:grid-cols-2' : undefined
                    }
                >
                    {!publicForm && (
                        <SelectField
                            id="registration_period_id"
                            label="Periode"
                            value={form.data.registration_period_id}
                            options={periods.map((item) => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={(value) =>
                                form.setData('registration_period_id', value)
                            }
                            error={form.errors.registration_period_id}
                            disabled={mode === 'edit'}
                        />
                    )}
                    <SelectField
                        id="program_id"
                        label="Program"
                        value={form.data.program_id}
                        options={programs
                            .filter(
                                (program) =>
                                    program.is_active ||
                                    program.id === applicant?.program_id,
                            )
                            .map((program) => ({
                                value: String(program.id),
                                label: program.name,
                            }))}
                        onChange={(value) => form.setData('program_id', value)}
                        error={form.errors.program_id}
                    />
                    <div
                        className={
                            publicForm
                                ? undefined
                                : 'md:col-span-2 lg:col-span-1'
                        }
                    >
                        <SelectField
                            id="residence_type"
                            label="Jenis santri"
                            value={form.data.residence_type}
                            options={[
                                {
                                    value: 'mukim',
                                    label: 'Mukim (menginap di asrama)',
                                },
                                {
                                    value: 'nduduk',
                                    label: 'Nduduk (tidak menginap)',
                                },
                            ]}
                            onChange={(value) =>
                                form.setData('residence_type', value)
                            }
                            error={form.errors.residence_type}
                        />
                    </div>
                    {mode === 'edit' && (
                        <p className="col-span-full text-xs text-muted-foreground">
                            Periode dan jenis kelamin mengikuti nomor registrasi
                            yang diterbitkan.
                        </p>
                    )}
                    {form.errors.registration_period_id && publicForm && (
                        <InputError
                            message={form.errors.registration_period_id}
                        />
                    )}
                </FormSection>
            )}
            <FormSection
                title={`${step(4)}. Pendidikan dan kemampuan`}
                publicForm={publicForm}
                contentClassName="md:grid-cols-2 lg:grid-cols-2"
            >
                <SelectField
                    id="last_education"
                    label="Pendidikan terakhir"
                    value={form.data.last_education}
                    options={educationLevels}
                    onChange={(value) => form.setData('last_education', value)}
                    error={form.errors.last_education}
                />
                <Field className="min-w-0">
                    <FieldLabel htmlFor="hafalan_juz">
                        Jumlah juz hafalan{' '}
                        {selected?.requires_hafalan ? '(wajib)' : '(opsional)'}
                    </FieldLabel>
                    <Input
                        id="hafalan_juz"
                        type="number"
                        min={selected?.requires_hafalan ? 1 : 0}
                        max={30}
                        value={form.data.hafalan_juz}
                        onChange={(event) =>
                            form.setData('hafalan_juz', event.target.value)
                        }
                        required={selected?.requires_hafalan}
                    />
                    <InputError message={form.errors.hafalan_juz} />
                </Field>
                <FieldSet className="col-span-full min-w-0">
                    <FieldLegend variant="label">Kemampuan dasar</FieldLegend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(
                            ['can_read_binnadhor', 'can_write_pegon'] as const
                        ).map((key) => (
                            <Field key={key} className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={key}
                                        checked={form.data[key]}
                                        onCheckedChange={(value) =>
                                            form.setData(key, value === true)
                                        }
                                    />
                                    <FieldLabel htmlFor={key}>
                                        {key === 'can_read_binnadhor'
                                            ? 'Bisa membaca bin-nadhor'
                                            : 'Bisa menulis pegon'}
                                    </FieldLabel>
                                </div>
                                <InputError message={form.errors[key]} />
                            </Field>
                        ))}
                    </div>
                </FieldSet>
            </FormSection>
            <FormSection
                title={`${step(5)}. Data orang tua / wali`}
                publicForm={publicForm}
            >
                <Field className="min-w-0 md:col-span-2 lg:col-span-1">
                    <FieldLabel htmlFor="guardian_name">Nama wali</FieldLabel>
                    <Input
                        id="guardian_name"
                        value={form.data.guardian_name}
                        onChange={(event) =>
                            form.setData('guardian_name', event.target.value)
                        }
                        required
                        maxLength={255}
                        aria-invalid={Boolean(form.errors.guardian_name)}
                    />
                    <InputError message={form.errors.guardian_name} />
                </Field>
                <SelectField
                    id="guardian_relation"
                    label="Hubungan dengan calon santri"
                    value={form.data.guardian_relation}
                    options={guardianRelations}
                    onChange={(value) =>
                        form.setData('guardian_relation', value)
                    }
                    error={form.errors.guardian_relation}
                />
                <Field className="min-w-0">
                    <FieldLabel htmlFor="guardian_phone">
                        Nomor WhatsApp wali
                    </FieldLabel>
                    <Input
                        id="guardian_phone"
                        type="tel"
                        value={form.data.guardian_phone}
                        onChange={(event) =>
                            form.setData('guardian_phone', event.target.value)
                        }
                        required
                        maxLength={255}
                        aria-invalid={Boolean(form.errors.guardian_phone)}
                    />
                    <InputError message={form.errors.guardian_phone} />
                </Field>
            </FormSection>
            {mode !== 'edit' && !portalForm && (
                <FormSection
                    title="6. Berkas pendaftaran"
                    publicForm={publicForm}
                >
                    {(Object.keys(documentLabels) as DocumentType[]).map(
                        (type) => (
                            <Field
                                key={type}
                                className={
                                    type === 'pas_foto'
                                        ? 'min-w-0 md:col-span-2 lg:col-span-1'
                                        : 'min-w-0'
                                }
                            >
                                <FieldLabel htmlFor={`document-${type}`}>
                                    {documentLabels[type]}{' '}
                                    {publicForm ? '(wajib)' : '(opsional)'}
                                </FieldLabel>
                                <Input
                                    id={`document-${type}`}
                                    type="file"
                                    accept={
                                        type === 'pas_foto'
                                            ? 'image/jpeg,image/png,image/webp'
                                            : 'application/pdf'
                                    }
                                    required={publicForm}
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;
                                        const error = file
                                            ? validateDocument(file, type)
                                            : null;
                                        if (error) {
                                            form.setError(
                                                `documents.${type}`,
                                                error,
                                            );
                                            event.target.value = '';
                                            form.setData('documents', {
                                                ...form.data.documents,
                                                [type]: null,
                                            });
                                        } else {
                                            form.clearErrors(
                                                `documents.${type}`,
                                            );
                                            form.setData('documents', {
                                                ...form.data.documents,
                                                [type]: file,
                                            });
                                        }
                                    }}
                                />
                                <FieldDescription>
                                    {type === 'pas_foto'
                                        ? 'Foto 3x4, JPG / PNG / WebP. Maksimal 2 MB.'
                                        : 'PDF. Maksimal 2 MB.'}
                                </FieldDescription>
                                <InputError
                                    message={form.errors[`documents.${type}`]}
                                />
                            </Field>
                        ),
                    )}
                </FormSection>
            )}
            {publicForm && (
                <FormSection
                    title="7. Akun portal calon santri"
                    publicForm={publicForm}
                >
                    <Field className="min-w-0 md:col-span-2 lg:col-span-1">
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            required
                            maxLength={255}
                            aria-invalid={Boolean(form.errors.email)}
                        />
                        <FieldDescription>
                            Untuk masuk ke portal dan menerima tautan
                            verifikasi. Satu email untuk satu pendaftar.
                        </FieldDescription>
                        <InputError message={form.errors.email} />
                    </Field>
                    <Field className="min-w-0">
                        <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            required
                            aria-invalid={Boolean(form.errors.password)}
                        />
                        <InputError message={form.errors.password} />
                    </Field>
                    <Field className="min-w-0">
                        <FieldLabel htmlFor="password_confirmation">
                            Ulangi kata sandi
                        </FieldLabel>
                        <PasswordInput
                            id="password_confirmation"
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </Field>
                </FormSection>
            )}
            <footer className="flex min-w-0 flex-col gap-4 border-t border-border pt-4">
                {!portalForm && (
                    <Field>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="agreed_to_rules"
                                checked={form.data.agreed_to_rules}
                                onCheckedChange={(value) =>
                                    form.setData(
                                        'agreed_to_rules',
                                        value === true,
                                    )
                                }
                            />
                            <FieldLabel htmlFor="agreed_to_rules">
                                Saya / wali menyetujui untuk menaati peraturan
                                pondok.
                            </FieldLabel>
                        </div>
                        <InputError message={form.errors.agreed_to_rules} />
                    </Field>
                )}
                <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                        id="website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.data.website}
                        onChange={(event) =>
                            form.setData('website', event.target.value)
                        }
                    />
                </div>
                <InputError message={form.errors.website} />
                <InputError message={form.errors.documents} />
                {form.progress && (
                    <p role="status" className="text-sm">
                        Mengunggah {form.progress.percentage}%
                    </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {mode === 'edit' || portalForm
                            ? 'Periksa kembali biodata sebelum menyimpan perubahan.'
                            : publicForm
                              ? 'Lengkapi data dan berkas wajib sebelum mengirim.'
                              : 'Berkas pendaftaran luring dapat dilengkapi kemudian.'}
                    </p>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                        {!publicForm && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={form.processing}
                                asChild
                            >
                                <Link
                                    href={
                                        portalForm
                                            ? portalHome()
                                            : mode === 'edit' && applicant
                                              ? show(applicant.id)
                                              : index()
                                    }
                                >
                                    Batal
                                </Link>
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={
                                form.processing ||
                                (!portalForm && !form.data.agreed_to_rules)
                            }
                        >
                            {form.processing
                                ? 'Menyimpan…'
                                : mode === 'edit' || portalForm
                                  ? 'Simpan perubahan'
                                  : 'Kirim pendaftaran'}
                        </Button>
                    </div>
                </div>
            </footer>
        </form>
    );
}
