import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlumniAdminPage } from '@/components/alumni/admin-page';
import { ProfileEditor } from '@/pages/alumni/profile';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { SelectField } from '@/components/select-field';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { update, verify } from '@/routes/admin/alumni';
import type { AlumniProfile, AlumniOptions } from '@/types/alumni';
export default function AdminAlumniForm({
    profile,
    santriCandidates = [],
    ...options
}: AlumniOptions & {
    profile: AlumniProfile;
    santriCandidates?: { id: number; full_name: string; entry_year: number }[];
}) {
    const form = useForm({
        status: 'approved',
        rejection_reason: '',
        santri_id: String(profile?.santri_id ?? ''),
    });
    return (
        <AlumniAdminPage title="Detail alumni">
            <ProfileEditor
                profile={profile}
                options={options}
                adminSubmit={update(profile.id)}
            />
            {profile && (
                <Frame spacing="default">
                    <FrameHeader>
                        <FrameTitle>Verifikasi profil</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <p>Status: {profile.verification_status}</p>
                        {profile.photo && (
                            <img
                                src={profile.photo}
                                alt="Foto alumni"
                                className="size-24 rounded-full object-cover"
                            />
                        )}
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.submit(verify(profile.id), {
                                    onSuccess: () =>
                                        toast.success('Verifikasi tersimpan'),
                                });
                            }}
                        >
                            {santriCandidates.length > 0 && (
                                <SelectField
                                    label="Kandidat santri (pilih manual)"
                                    value={form.data.santri_id}
                                    onChange={(value) =>
                                        form.setData('santri_id', value)
                                    }
                                    options={santriCandidates.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.full_name} — masuk ${item.entry_year}`,
                                    }))}
                                />
                            )}
                            <SelectField
                                label="Keputusan"
                                value={form.data.status}
                                onChange={(value) =>
                                    form.setData('status', value)
                                }
                                options={[
                                    { value: 'approved', label: 'Setujui' },
                                    { value: 'rejected', label: 'Tolak' },
                                ]}
                            />
                            <Field>
                                <FieldLabel htmlFor="rejection-reason">
                                    Alasan (wajib jika ditolak)
                                </FieldLabel>
                                <Textarea
                                    id="rejection-reason"
                                    required={form.data.status === 'rejected'}
                                    value={form.data.rejection_reason}
                                    onChange={(event) =>
                                        form.setData(
                                            'rejection_reason',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.rejection_reason}
                                />
                            </Field>
                            <Button type="submit" disabled={form.processing}>
                                Simpan keputusan
                            </Button>
                        </form>
                    </FramePanel>
                </Frame>
            )}
        </AlumniAdminPage>
    );
}
