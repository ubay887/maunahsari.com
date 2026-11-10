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
import { store, update, verify } from '@/routes/admin/alumni';
import { store as claimCode } from '@/routes/admin/alumni/claims';
import { alumniRequest } from '@/lib/alumni-request';
import type { AlumniProfile, AlumniOptions } from '@/types/alumni';
export default function AdminAlumniForm({
    profile,
    santriCandidates = [],
    ...options
}: AlumniOptions & {
    profile: AlumniProfile | null;
    santriCandidates?: { id: number; full_name: string; entry_year: number }[];
}) {
    const form = useForm({
        status: 'approved',
        rejection_reason: '',
        santri_id: String(profile?.santri_id ?? ''),
    });
    const [code, setCode] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    async function generateCode() {
        if (!profile) return;
        setPending(true);
        try {
            const response = await alumniRequest(claimCode(profile.id));
            const data: unknown = await response.json();
            if (
                typeof data !== 'object' ||
                data === null ||
                !('code' in data) ||
                typeof data.code !== 'string'
            )
                throw new Error();
            setCode(data.code);
        } catch {
            toast.error('Kode gagal dibuat');
        } finally {
            setPending(false);
        }
    }
    return (
        <AlumniAdminPage title={profile ? 'Detail alumni' : 'Input alumni'}>
            <ProfileEditor
                profile={profile}
                options={options}
                adminSubmit={profile ? update(profile.id) : store()}
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
                        {profile.source === 'import' &&
                            profile.user_id === null && (
                                <div className="flex flex-col gap-4">
                                    <p>
                                        Kode baru mengganti kode sebelumnya dan
                                        hanya tampil sekali.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={pending}
                                        onClick={() => void generateCode()}
                                    >
                                        Buat kode klaim
                                    </Button>
                                    {code && (
                                        <p
                                            role="status"
                                            className="font-mono break-all"
                                        >
                                            {code}
                                        </p>
                                    )}
                                </div>
                            )}
                    </FramePanel>
                </Frame>
            )}
        </AlumniAdminPage>
    );
}
