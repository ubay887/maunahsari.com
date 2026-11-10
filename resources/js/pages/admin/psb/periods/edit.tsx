import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/psb/periods';
import { PeriodForm } from './period-form';
import type { Period } from '@/types/psb';

export default function Edit({ period }: { period: Period }) {
    return (
        <PsbAdminPage
            title="Edit periode"
            description={period.name}
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>
                        <ArrowLeft aria-hidden="true" />
                        Daftar periode
                    </Link>
                </Button>
            }
        >
            <PeriodForm period={period} />
        </PsbAdminPage>
    );
}
