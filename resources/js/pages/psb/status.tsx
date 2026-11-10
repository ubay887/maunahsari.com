import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { PublicState } from '@/components/psb/public-state';
import { StatusBadge } from '@/components/psb/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { dateTime } from '@/lib/psb';
import { store } from '@/routes/psb/status';
import type { ApplicantStatus } from '@/types/psb';
type Result = {
    status: ApplicantStatus;
    status_label: string;
    visit_scheduled_at: string | null;
    decision_reason: string | null;
};
export default function Status({ result }: { result: Result | null }) {
    const form = useForm({
        registration_number: '',
        guardian_phone: '',
        website: '',
    });
    return (
        <>
            <Head title="Cek status PSB">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <PublicState>
                <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cek status pendaftaran</CardTitle>
                            <CardDescription>
                                Nomor registrasi dan WhatsApp wali harus sesuai.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="flex flex-col gap-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.submit(store(), {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                <Field>
                                    <FieldLabel htmlFor="registration_number">
                                        Nomor registrasi
                                    </FieldLabel>
                                    <Input
                                        id="registration_number"
                                        autoComplete="off"
                                        required
                                        value={form.data.registration_number}
                                        onChange={(event) =>
                                            form.setData(
                                                'registration_number',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={100}
                                    />
                                    <InputError
                                        message={
                                            form.errors.registration_number
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="guardian_phone">
                                        WhatsApp wali
                                    </FieldLabel>
                                    <Input
                                        id="guardian_phone"
                                        type="tel"
                                        required
                                        value={form.data.guardian_phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'guardian_phone',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={30}
                                    />
                                    <InputError
                                        message={form.errors.guardian_phone}
                                    />
                                </Field>
                                <div className="hidden" aria-hidden="true">
                                    <label htmlFor="website">Website</label>
                                    <input
                                        id="website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={form.data.website}
                                        onChange={(event) =>
                                            form.setData(
                                                'website',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <InputError message={form.errors.website} />
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing
                                        ? 'Memeriksa…'
                                        : 'Cek status'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    {result && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Status pendaftaran</CardTitle>
                            </CardHeader>
                            <CardContent
                                className="flex flex-col gap-4"
                                aria-live="polite"
                            >
                                <div>
                                    <StatusBadge status={result.status} />
                                </div>
                                <p className="text-sm">
                                    Jadwal sowan:{' '}
                                    {dateTime(result.visit_scheduled_at)}
                                </p>
                                {result.decision_reason && (
                                    <Alert variant="warning">
                                        <AlertTitle>
                                            Alasan penolakan
                                        </AlertTitle>
                                        <AlertDescription>
                                            {result.decision_reason}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </PublicState>
        </>
    );
}
