import { useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { PortalPage } from '@/components/alumni/portal-page';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
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
import { destroy, show } from '@/routes/alumni/data';

export default function DataPage() {
    const [confirm, setConfirm] = useState(false);
    const form = useForm({ password: '', confirmation: '' });

    return (
        <PortalPage
            title="Data saya"
            description="Unduh atau hapus data akun Anda."
        >
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Unduh data</FrameTitle>
                    <FrameDescription>
                        Salinan JSON akun, profil, dan riwayat persetujuan.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        asChild
                    >
                        <a href={show.url()}>
                            <Download data-icon="inline-start" aria-hidden />
                            Unduh data JSON
                        </a>
                    </Button>
                </FramePanel>
            </Frame>
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Hapus akun</FrameTitle>
                    <FrameDescription>
                        Tindakan ini tidak bisa dibatalkan.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    <Alert variant="destructive">
                        <AlertTitle>Penghapusan permanen</AlertTitle>
                        <AlertDescription>
                            Akun, profil, foto, permintaan kontak, dan
                            persetujuan dihapus.
                        </AlertDescription>
                    </Alert>
                    <Field>
                        <FieldLabel htmlFor="delete-password">
                            Kata sandi
                        </FieldLabel>
                        <Input
                            id="delete-password"
                            type="password"
                            autoComplete="current-password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                        />
                        <InputError message={form.errors.password} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="delete-confirm">
                            Ketik HAPUS
                        </FieldLabel>
                        <Input
                            id="delete-confirm"
                            value={form.data.confirmation}
                            onChange={(event) =>
                                form.setData('confirmation', event.target.value)
                            }
                        />
                        <InputError message={form.errors.confirmation} />
                    </Field>
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={() => setConfirm(true)}
                    >
                        Hapus akun dan profil
                    </Button>
                </FramePanel>
            </Frame>
            <ConfirmDeleteDialog
                open={confirm}
                onOpenChange={setConfirm}
                title="akun dan profil secara permanen"
                processing={form.processing}
                onConfirm={() =>
                    form.submit(destroy(), { onError: () => setConfirm(false) })
                }
            />
        </PortalPage>
    );
}
