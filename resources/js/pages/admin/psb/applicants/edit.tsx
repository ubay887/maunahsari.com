import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/admin/psb/applicants';
import { ApplicationForm } from '@/components/psb/application-form';
import { PsbAdminPage } from '@/components/psb/admin-page';
import type { Applicant, FormOptions } from '@/types/psb';
export default function Edit(props: FormOptions & { applicant: Applicant }) {
    return (
        <PsbAdminPage
            title="Edit biodata"
            description={`${props.applicant.full_name} / ${props.applicant.registration_number}`}
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={show(props.applicant.id)}>
                        <ArrowLeft aria-hidden="true" />
                        Detail pendaftar
                    </Link>
                </Button>
            }
        >
            <ApplicationForm {...props} mode="edit" />
        </PsbAdminPage>
    );
}
