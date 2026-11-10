import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { ApplicationForm } from '@/components/psb/application-form';
import { Contacts } from '@/components/psb/contacts';
import { PublicState } from '@/components/psb/public-state';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/psb';
import type { Period, Program, Quota, FormOptions } from '@/types/psb';
export default function Register({
    period,
    programs,
    quotas,
    closed,
    closedMessage,
    selectedProgram,
    selectedGender,
    guardianRelations,
    educationLevels,
    addressOptions,
}: Pick<
    FormOptions,
    'guardianRelations' | 'educationLevels' | 'addressOptions'
> & {
    period: Period | null;
    programs: Program[];
    quotas: Quota[];
    closed: boolean;
    closedMessage: string;
    selectedProgram: number;
    selectedGender: string;
}) {
    return (
        <>
            <Head title="Formulir PSB">
                <meta
                    name="description"
                    content="Formulir pendaftaran santri baru."
                />
                <meta
                    property="og:title"
                    content="Formulir Penerimaan Santri Baru"
                />
                <meta
                    property="og:description"
                    content="Daftar program pondok putra dan putri."
                />
                <meta property="og:type" content="website" />
            </Head>
            <PublicState>
                <PageHeader
                    size="lg"
                    title="Formulir PSB"
                    description={period?.name ?? 'Belum ada periode aktif'}
                    actions={
                        <Button type="button" variant="outline" asChild>
                            <Link href={index()}>Informasi PSB</Link>
                        </Button>
                    }
                />
                {closed || !period ? (
                    <Alert variant="warning">
                        <AlertTitle>{closedMessage}</AlertTitle>
                        <AlertDescription>
                            <div className="flex flex-col items-start gap-4">
                                <Contacts period={period} />
                                <Button type="button" variant="outline" asChild>
                                    <Link href={index()}>
                                        Lihat ketersediaan program lain
                                    </Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <ApplicationForm
                        key={`${period.id}-${selectedProgram}-${selectedGender}`}
                        periods={[period]}
                        programs={programs}
                        quotas={quotas}
                        mode="public"
                        initialProgram={selectedProgram}
                        initialGender={selectedGender}
                        guardianRelations={guardianRelations}
                        educationLevels={educationLevels}
                        addressOptions={addressOptions}
                    />
                )}
            </PublicState>
        </>
    );
}
