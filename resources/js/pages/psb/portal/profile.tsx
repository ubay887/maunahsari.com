import { Link } from '@inertiajs/react';
import { PortalPage } from '@/components/alumni/portal-page';
import { ApplicationForm } from '@/components/psb/application-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import { home } from '@/routes/psb/portal';
import type {
    FormApplicant,
    FormOptions,
    PortalApplicant,
    Program,
} from '@/types/psb';

export default function PortalProfile({
    applicant,
    summary,
    guardianRelations,
    educationLevels,
    addressOptions,
}: Pick<
    FormOptions,
    'guardianRelations' | 'educationLevels' | 'addressOptions'
> & {
    applicant: FormApplicant & { program: Program };
    summary: PortalApplicant;
}) {
    return (
        <PortalPage
            title="Data pendaftaran"
            description={`Nomor registrasi ${summary.registration_number}`}
        >
            {summary.can_edit ? (
                <ApplicationForm
                    mode="portal"
                    applicant={applicant}
                    periods={[]}
                    programs={[applicant.program]}
                    guardianRelations={guardianRelations}
                    educationLevels={educationLevels}
                    addressOptions={addressOptions}
                />
            ) : (
                <Alert variant="info">
                    <AlertTitle>Data terkunci</AlertTitle>
                    <AlertDescription>
                        <div className="flex flex-col items-start gap-4">
                            <p>
                                Pendaftaran sudah diproses pengurus sehingga
                                data tidak dapat diubah dari portal. Hubungi
                                narahubung bila ada yang perlu diperbaiki.
                            </p>
                            <Button type="button" variant="outline" asChild>
                                <Link href={home()}>Kembali ke beranda</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </PortalPage>
    );
}
