import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { PortalPage } from '@/components/alumni/portal-page';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { store } from '@/routes/alumni/claim';
export default function ClaimPage() {
    const form = useForm({ code: '' });
    return (
        <PortalPage
            title="Klaim profil"
            description="Hubungkan akun dengan data alumni yang sudah ada."
        >
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Kode klaim</FrameTitle>
                    <FrameDescription>
                        Masukkan kode sekali pakai dari pengurus.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.submit(store());
                        }}
                    >
                        <Field>
                            <FieldLabel htmlFor="claim-code">
                                Kode klaim
                            </FieldLabel>
                            <Input
                                id="claim-code"
                                autoComplete="off"
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.code} />
                        </Field>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={form.processing}
                        >
                            Klaim profil
                        </Button>
                    </form>
                </FramePanel>
            </Frame>
        </PortalPage>
    );
}
