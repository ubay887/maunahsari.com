import { useForm, Link } from '@inertiajs/react';
import { PortalPage } from '@/components/alumni/portal-page';
import { StepTrack } from '@/components/portal/kit';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { PrivacyFields } from '@/components/alumni/privacy-fields';
import { SelectField } from '@/components/select-field';
import InputError from '@/components/input-error';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { profileDefaults, alumniLabels, openToOptions } from '@/lib/alumni';
import { update } from '@/routes/alumni/profile';
import type { AlumniProfile, AlumniOptions, ProfileData } from '@/types/alumni';

/**
 * Kelompok isian, berurutan dari data paling pokok ke yang turunannya.
 * Pengajuan mandiri menampilkannya satu per satu; admin melihat semuanya.
 */
const steps = [
    'Identitas',
    'Kesantrian',
    'Domisili & kontak',
    'Pekerjaan',
    'Privasi',
];
const lastStep = steps.length - 1;

const stepOfField: Record<string, number> = {
    full_name: 0,
    nickname: 0,
    gender: 0,
    birth_place: 0,
    birth_date: 0,
    photo: 0,
    remove_photo: 0,
    angkatan: 1,
    alumni_status: 1,
    program_id: 1,
    entry_year: 1,
    leave_year: 1,
    santri_id: 1,
    province_id: 2,
    regency_id: 2,
    phone_whatsapp: 2,
    social_links: 2,
    profession: 3,
    organization: 3,
    field: 3,
    skills: 3,
    bio: 3,
    open_to: 3,
};

function stepOfError(key: string): number {
    return stepOfField[key.split('.')[0] ?? key] ?? lastStep;
}

const socialLinks = [
    { key: 'website', label: 'Website' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'instagram', label: 'Instagram' },
];

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <FieldSet>
            <div className="flex flex-col gap-0.5">
                <FieldLegend variant="label" className="mb-0">
                    {title}
                </FieldLegend>
                {description && (
                    <FieldDescription className="text-xs">
                        {description}
                    </FieldDescription>
                )}
            </div>
            <FieldGroup className="gap-4">{children}</FieldGroup>
        </FieldSet>
    );
}

export function ProfileEditor({
    profile,
    options,
    adminSubmit,
}: {
    profile: AlumniProfile | null;
    options: AlumniOptions;
    adminSubmit?: { url: string; method: 'post' };
}) {
    const [step, setStep] = useState(0);
    const [skillsText, setSkillsText] = useState(
        profile?.skills?.join(', ') ?? '',
    );
    const form = useForm<ProfileData>(profileDefaults(profile, options));
    const isAdmin = !!adminSubmit;
    const showStep = (index: number) => isAdmin || step === index;
    const regencies = options.regencies.filter(
        (item) => String(item.province_id) === form.data.province_id,
    );
    const select = (
        key:
            | 'gender'
            | 'alumni_status'
            | 'program_id'
            | 'province_id'
            | 'regency_id',
        label: string,
        values: { value: string; label: string }[],
        extra: { placeholder?: string; disabled?: boolean } = {},
    ) => (
        <SelectField
            key={key}
            label={label}
            value={form.data[key]}
            onChange={(value) => {
                form.setData(key, value);
                if (key === 'province_id') form.setData('regency_id', '');
            }}
            options={values}
            error={form.errors[key]}
            {...extra}
        />
    );
    const input = (
        key:
            | 'full_name'
            | 'nickname'
            | 'birth_place'
            | 'birth_date'
            | 'phone_whatsapp'
            | 'entry_year'
            | 'leave_year'
            | 'angkatan'
            | 'profession'
            | 'organization'
            | 'field',
        label: string,
        type: 'text' | 'number' | 'date' = 'text',
    ) => (
        <Field key={key}>
            <FieldLabel htmlFor={key}>{label}</FieldLabel>
            <Input
                id={key}
                type={type}
                inputMode={type === 'number' ? 'numeric' : undefined}
                value={form.data[key]}
                onChange={(event) => form.setData(key, event.target.value)}
            />
            <InputError message={form.errors[key]} />
        </Field>
    );
    return (
        <Frame spacing="default">
            <FrameHeader className="flex flex-col gap-0.5">
                <FrameTitle>
                    {profile ? 'Edit profil' : 'Lengkapi profil'}
                </FrameTitle>
                <FrameDescription>
                    {isAdmin
                        ? 'Data manual tetap tersembunyi sampai alumni memilih privasi.'
                        : `Langkah ${step + 1} dari ${steps.length}`}
                </FrameDescription>
            </FrameHeader>
            <FramePanel className="flex flex-col gap-6">
                {!isAdmin && (
                    <StepTrack
                        label="Langkah pengisian profil"
                        steps={steps}
                        current={step}
                    />
                )}
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.transform((data) => ({
                            ...data,
                            directory_visible:
                                data.directory_visible === ''
                                    ? null
                                    : data.directory_visible === '1',
                        }));
                        form.submit(adminSubmit ?? update(), {
                            forceFormData: true,
                            onSuccess: () => toast.success('Profil tersimpan'),
                            onError: (errors) => {
                                toast.error('Periksa isian profil');
                                setStep(
                                    Math.min(
                                        ...Object.keys(errors).map(stepOfError),
                                        lastStep,
                                    ),
                                );
                            },
                        });
                    }}
                >
                    {showStep(0) && (
                        <FormSection
                            title="Identitas"
                            description="Data diri dasar. Pondok ditentukan otomatis dari jenis kelamin."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                {input('full_name', 'Nama lengkap')}
                                {input(
                                    'nickname',
                                    'Nama panggilan / lakop (opsional)',
                                )}
                                {select('gender', 'Jenis kelamin', [
                                    { value: 'male', label: 'Laki-laki' },
                                    { value: 'female', label: 'Perempuan' },
                                ])}
                                {input('birth_place', 'Tempat lahir')}
                                {input('birth_date', 'Tanggal lahir', 'date')}
                            </div>
                            <Field>
                                <FieldLabel htmlFor="photo">
                                    Foto (opsional; JPG, PNG, WebP; maksimal 2
                                    MB)
                                </FieldLabel>
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(event) =>
                                        form.setData(
                                            'photo',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={form.errors.photo} />
                            </Field>
                            {profile?.photo && (
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="remove-photo"
                                        checked={form.data.remove_photo}
                                        onCheckedChange={(value) =>
                                            form.setData(
                                                'remove_photo',
                                                value === true,
                                            )
                                        }
                                    />
                                    <FieldLabel htmlFor="remove-photo">
                                        Hapus foto saat menyimpan
                                    </FieldLabel>
                                </Field>
                            )}
                        </FormSection>
                    )}
                    {showStep(1) && (
                        <FormSection
                            title="Kesantrian"
                            description="Riwayat di pondok. Tahun masuk dan keluar boleh dikosongkan bila tidak ingat."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                {input('angkatan', 'Angkatan')}
                                {select(
                                    'alumni_status',
                                    'Status kesantrian',
                                    ['lulus', 'keluar', 'mengabdi'].map(
                                        (value) => ({
                                            value,
                                            label: alumniLabels[value],
                                        }),
                                    ),
                                )}
                                {select(
                                    'program_id',
                                    'Program (opsional)',
                                    options.programs.map((item) => ({
                                        value: String(item.id),
                                        label: item.name,
                                    })),
                                )}
                                {isAdmin && (
                                    <Field>
                                        <FieldLabel htmlFor="santri_id">
                                            ID santri (opsional, hubungkan
                                            manual)
                                        </FieldLabel>
                                        <Input
                                            id="santri_id"
                                            value={
                                                form.data.santri_id ??
                                                String(profile?.santri_id ?? '')
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'santri_id',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.santri_id}
                                        />
                                    </Field>
                                )}
                                {input(
                                    'entry_year',
                                    'Tahun masuk (opsional)',
                                    'number',
                                )}
                                {input(
                                    'leave_year',
                                    'Tahun keluar (opsional)',
                                    'number',
                                )}
                            </div>
                        </FormSection>
                    )}
                    {showStep(2) && (
                        <FormSection
                            title="Domisili & kontak"
                            description="Pilih provinsi lebih dulu, lalu kota/kabupaten. Kontak tidak tampil langsung ke alumni lain."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                {select(
                                    'province_id',
                                    'Provinsi',
                                    options.provinces.map((item) => ({
                                        value: String(item.id),
                                        label: item.name,
                                    })),
                                )}
                                {select(
                                    'regency_id',
                                    'Kota/kabupaten',
                                    regencies.map((item) => ({
                                        value: String(item.id),
                                        label: item.name,
                                    })),
                                    {
                                        placeholder: form.data.province_id
                                            ? 'Pilih…'
                                            : 'Pilih provinsi dahulu',
                                        disabled: regencies.length === 0,
                                    },
                                )}
                                {input('phone_whatsapp', 'WhatsApp (opsional)')}
                            </div>
                            {(options.provinces.length === 0 ||
                                (form.data.province_id !== '' &&
                                    regencies.length === 0)) && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    Data wilayah belum tersedia, sehingga
                                    provinsi atau kota/kabupaten belum bisa
                                    dipilih. Hubungi pengurus.
                                </p>
                            )}
                            <div className="grid gap-4 sm:grid-cols-3">
                                {socialLinks.map(({ key, label }) => (
                                    <Field key={key}>
                                        <FieldLabel htmlFor={key}>
                                            {label} (opsional)
                                        </FieldLabel>
                                        <Input
                                            id={key}
                                            type="url"
                                            placeholder="https://"
                                            value={
                                                form.data.social_links[key] ??
                                                ''
                                            }
                                            onChange={(event) =>
                                                form.setData('social_links', {
                                                    ...form.data.social_links,
                                                    [key]: event.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={
                                                form.errors[
                                                    `social_links.${key}` as keyof typeof form.errors
                                                ]
                                            }
                                        />
                                    </Field>
                                ))}
                            </div>
                        </FormSection>
                    )}
                    {showStep(3) && (
                        <FormSection
                            title="Pekerjaan & peluang"
                            description="Profesi, keahlian, dan kesediaan agar mudah ditemukan alumni lain."
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                {input('profession', 'Profesi (opsional)')}
                                {input('organization', 'Organisasi (opsional)')}
                                {input('field', 'Bidang (opsional)')}
                            </div>
                            <Field>
                                <FieldLabel htmlFor="skills">
                                    Keahlian (opsional; pisahkan dengan koma)
                                </FieldLabel>
                                <Input
                                    id="skills"
                                    value={skillsText}
                                    onChange={(event) => {
                                        setSkillsText(event.target.value);
                                        form.setData(
                                            'skills',
                                            event.target.value
                                                .split(',')
                                                .map((value) => value.trim())
                                                .filter(Boolean),
                                        );
                                    }}
                                />
                                <InputError message={form.errors.skills} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="bio">
                                    Bio (opsional; maksimal 500 karakter)
                                </FieldLabel>
                                <Textarea
                                    id="bio"
                                    maxLength={500}
                                    value={form.data.bio}
                                    onChange={(event) =>
                                        form.setData('bio', event.target.value)
                                    }
                                />
                                <InputError message={form.errors.bio} />
                            </Field>
                            <FieldSet>
                                <FieldLegend variant="label" className="mb-0">
                                    Kesediaan
                                </FieldLegend>
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    {openToOptions.map((value) => (
                                        <Field
                                            key={value}
                                            orientation="horizontal"
                                            className="w-auto"
                                        >
                                            <Checkbox
                                                id={value}
                                                checked={form.data.open_to.includes(
                                                    value,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'open_to',
                                                        checked === true
                                                            ? [
                                                                  ...form.data
                                                                      .open_to,
                                                                  value,
                                                              ]
                                                            : form.data.open_to.filter(
                                                                  (item) =>
                                                                      item !==
                                                                      value,
                                                              ),
                                                    )
                                                }
                                            />
                                            <FieldLabel htmlFor={value}>
                                                {alumniLabels[value]}
                                            </FieldLabel>
                                        </Field>
                                    ))}
                                </div>
                                <InputError message={form.errors.open_to} />
                            </FieldSet>
                        </FormSection>
                    )}
                    {!isAdmin && step === lastStep && (
                        <PrivacyFields
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            fields={options.visibilityFields}
                        />
                    )}
                    {Object.keys(form.errors).length > 0 && (
                        <div role="alert" className="text-sm text-destructive">
                            <p>
                                Profil belum tersimpan. Periksa semua langkah:
                            </p>
                            {Object.entries(form.errors).map(([key, value]) => (
                                <p key={key}>
                                    {alumniLabels[key] ??
                                        alumniLabels[key.replace(/_id$/, '')] ??
                                        key}
                                    : {value}
                                </p>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        {!isAdmin && step > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setStep(step - 1)}
                            >
                                Kembali
                            </Button>
                        )}
                        {!isAdmin && step < lastStep ? (
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={() => setStep(step + 1)}
                            >
                                Lanjut
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={form.processing}
                            >
                                {isAdmin ? 'Simpan' : 'Ajukan profil'}
                            </Button>
                        )}
                    </div>
                </form>
            </FramePanel>
        </Frame>
    );
}
export default function ProfilePage({
    profile,
    ...options
}: AlumniOptions & { profile: AlumniProfile | null }) {
    return (
        <PortalPage
            title="Profil"
            description="Lengkapi data agar dapat ditemukan sesama alumni."
        >
            <ProfileEditor profile={profile} options={options} />
        </PortalPage>
    );
}
