import { useForm, Link } from '@inertiajs/react';
import { PortalPage } from '@/components/alumni/portal-page';
import { StepTrack } from '@/components/portal/kit';
import { useState } from 'react';
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
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { profileDefaults, alumniLabels } from '@/lib/alumni';
import { update } from '@/routes/alumni/profile';
import { index as claim } from '@/routes/alumni/claim';
import type { AlumniProfile, AlumniOptions, ProfileData } from '@/types/alumni';
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
    const select = (
        key:
            | 'gender'
            | 'pondok'
            | 'alumni_status'
            | 'activity_status'
            | 'program_id'
            | 'province_id'
            | 'regency_id',
        label: string,
        values: { value: string; label: string }[],
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
        />
    );
    const input = (
        key:
            | 'full_name'
            | 'phone_whatsapp'
            | 'entry_year'
            | 'leave_year'
            | 'angkatan'
            | 'profession'
            | 'organization'
            | 'field',
        label: string,
        number = false,
    ) => (
        <Field key={key}>
            <FieldLabel htmlFor={key}>{label}</FieldLabel>
            <Input
                id={key}
                type={number ? 'number' : 'text'}
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
                        : `Langkah ${step + 1} dari 4`}
                </FrameDescription>
            </FrameHeader>
            <FramePanel className="flex flex-col gap-6">
                {!isAdmin && (
                    <StepTrack
                        label="Langkah pengisian profil"
                        steps={[
                            'Identitas',
                            'Domisili',
                            'Pekerjaan',
                            'Privasi',
                        ]}
                        current={step}
                    />
                )}
                <form
                    className="flex flex-col gap-4"
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
                            onError: () => {
                                toast.error('Periksa isian profil');
                                setStep(0);
                            },
                        });
                    }}
                >
                    {(isAdmin || step === 0) && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {input('full_name', 'Nama lengkap')}
                            {select('gender', 'Jenis kelamin', [
                                { value: 'male', label: 'Laki-laki' },
                                { value: 'female', label: 'Perempuan' },
                            ])}
                            {input('entry_year', 'Tahun masuk', true)}
                            {input('leave_year', 'Tahun keluar', true)}
                            {input('angkatan', 'Angkatan')}
                            {select('pondok', 'Pondok', [
                                { value: 'putra', label: 'Putra' },
                                { value: 'putri', label: 'Putri' },
                            ])}
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
                                'Program',
                                options.programs.map((item) => ({
                                    value: String(item.id),
                                    label: item.name,
                                })),
                            )}
                            {isAdmin && (
                                <Field>
                                    <FieldLabel htmlFor="santri_id">
                                        ID santri (opsional, hubungkan manual)
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
                        </div>
                    )}
                    {(isAdmin || step === 1) && (
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
                                options.regencies
                                    .filter(
                                        (item) =>
                                            String(item.province_id) ===
                                            form.data.province_id,
                                    )
                                    .map((item) => ({
                                        value: String(item.id),
                                        label: item.name,
                                    })),
                            )}
                            {input(
                                'phone_whatsapp',
                                'WhatsApp (opsional, tidak tampil langsung)',
                            )}
                        </div>
                    )}
                    {(isAdmin || step === 2) && (
                        <div className="flex flex-col gap-4">
                            {select(
                                'activity_status',
                                'Aktivitas',
                                [
                                    'bekerja',
                                    'wirausaha',
                                    'studi',
                                    'mengabdi',
                                    'lainnya',
                                ].map((value) => ({
                                    value,
                                    label: alumniLabels[value],
                                })),
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {input('profession', 'Profesi')}
                                {input('organization', 'Organisasi')}
                                {input('field', 'Bidang')}
                            </div>
                            <Field>
                                <FieldLabel htmlFor="skills">
                                    Keahlian (pisahkan koma)
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
                                    Bio (maksimal 500 karakter)
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
                            <div className="flex flex-wrap gap-4">
                                {[
                                    'ready_to_help',
                                    'seeking_job',
                                    'hiring',
                                    'mentoring',
                                ].map((value) => (
                                    <Field key={value}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={value}
                                                checked={form.data.open_to.includes(
                                                    value,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'open_to',
                                                        checked
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
                                        </div>
                                    </Field>
                                ))}
                            </div>
                            {['website', 'linkedin', 'instagram'].map((key) => (
                                <Field key={key}>
                                    <FieldLabel htmlFor={key}>{key}</FieldLabel>
                                    <Input
                                        id={key}
                                        type="url"
                                        value={
                                            form.data.social_links[key] ?? ''
                                        }
                                        onChange={(event) =>
                                            form.setData('social_links', {
                                                ...form.data.social_links,
                                                [key]: event.target.value,
                                            })
                                        }
                                    />
                                </Field>
                            ))}
                            <Field>
                                <FieldLabel htmlFor="photo">
                                    Foto opsional (JPG, PNG, WebP; maksimal 2
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
                                <Field>
                                    <div className="flex items-center gap-2">
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
                                    </div>
                                </Field>
                            )}
                        </div>
                    )}
                    {!isAdmin && step === 3 && (
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
                                    {key}: {value}
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
                        {!isAdmin && step < 3 ? (
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
            actions={
                !profile && (
                    <Button type="button" variant="outline" asChild>
                        <Link href={claim()}>Klaim profil lama</Link>
                    </Button>
                )
            }
        >
            <ProfileEditor profile={profile} options={options} />
        </PortalPage>
    );
}
