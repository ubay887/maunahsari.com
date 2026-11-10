import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/psb/applicants';
import { ApplicationForm } from '@/components/psb/application-form';
import { PsbAdminPage } from '@/components/psb/admin-page';
import type { FormOptions } from '@/types/psb';
export default function Create(props: FormOptions) {
    return (
        <PsbAdminPage
            title="Pendaftaran luring"
            description="Catat biodata dan berkas calon santri yang mendaftar langsung."
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>
                        <ArrowLeft aria-hidden="true" />
                        Daftar pendaftar
                    </Link>
                </Button>
            }
        >
            <ApplicationForm {...props} mode="offline" />
        </PsbAdminPage>
    );
}
