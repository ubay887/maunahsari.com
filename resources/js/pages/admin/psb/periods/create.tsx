import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/psb/periods';
import { PeriodForm } from './period-form';

export default function Create() {
    return (
        <PsbAdminPage
            title="Tambah periode"
            description="Siapkan jadwal dan informasi penerimaan santri."
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>
                        <ArrowLeft aria-hidden="true" />
                        Daftar periode
                    </Link>
                </Button>
            }
        >
            <PeriodForm />
        </PsbAdminPage>
    );
}
