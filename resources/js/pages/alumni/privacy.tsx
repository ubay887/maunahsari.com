import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { PrivacyFields } from '@/components/alumni/privacy-fields';
import { PortalPage } from '@/components/alumni/portal-page';
import {
    Frame,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { privacyDefaults } from '@/lib/alumni';
import { update } from '@/routes/alumni/privacy';
import type { AlumniOptions, AlumniProfile, PrivacyData } from '@/types/alumni';
export default function PrivacyPage({
    profile,
    ...options
}: AlumniOptions & { profile: AlumniProfile }) {
    const form = useForm<PrivacyData>(privacyDefaults(profile, options));
    return (
        <PortalPage
            title="Privasi"
            description="Atur siapa yang dapat melihat data profil Anda."
        >
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Pengaturan privasi</FrameTitle>
                </FrameHeader>
                <FramePanel>
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
                            form.submit(update(), {
                                onSuccess: () =>
                                    toast.success('Privasi tersimpan'),
                                onError: () =>
                                    toast.error('Privasi belum tersimpan'),
                            });
                        }}
                    >
                        <PrivacyFields
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            fields={options.visibilityFields}
                        />
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={form.processing}
                        >
                            Simpan privasi
                        </Button>
                    </form>
                </FramePanel>
            </Frame>
        </PortalPage>
    );
}
