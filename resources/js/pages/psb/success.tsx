import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { PublicState } from '@/components/psb/public-state';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { home as portalHome } from '@/routes/psb/portal';
import { index } from '@/routes/psb/status';
import type { Applicant } from '@/types/psb';
export default function Success({
    registration,
    programName,
    contact,
    accountEmail,
}: {
    registration: Pick<
        Applicant,
        'registration_number' | 'full_name' | 'pondok' | 'residence_type'
    >;
    programName: string;
    contact: string | null;
    accountEmail: string | null;
}) {
    return (
        <>
            <Head title="Bukti pendaftaran PSB">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <PublicState>
                <PageHeader
                    size="lg"
                    title="Pendaftaran tersimpan"
                    description="Simpan nomor ini untuk cek status dan administrasi di kantor."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Nomor registrasi</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-2xl font-semibold break-all tabular-nums">
                            {registration.registration_number}
                        </p>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2">
                            {[
                                ['Nama', registration.full_name],
                                ['Program', programName],
                                ['Pondok', registration.pondok],
                                ['Jenis santri', registration.residence_type],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex flex-col gap-1"
                                >
                                    <dt className="text-xs text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.print()}
                            >
                                Cetak / simpan bukti
                            </Button>
                            <Button type="button" asChild>
                                <Link href={index()}>Cek status</Link>
                            </Button>
                            {contact && (
                                <Button type="button" variant="outline" asChild>
                                    <a
                                        href={`https://wa.me/${contact}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        WhatsApp narahubung
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
                {accountEmail && (
                    <Alert variant="success">
                        <AlertTitle>Akun portal sudah dibuat</AlertTitle>
                        <AlertDescription>
                            <div className="flex flex-col items-start gap-4">
                                <p>
                                    Kami mengirim tautan verifikasi ke{' '}
                                    <span className="font-medium break-all">
                                        {accountEmail}
                                    </span>
                                    . Verifikasi email untuk mengelola berkas
                                    dan melihat status di portal calon santri.
                                </p>
                                <Button type="button" asChild>
                                    <Link href={portalHome()}>
                                        Buka portal calon santri
                                    </Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
                <Alert variant="info">
                    <AlertTitle>Langkah berikutnya</AlertTitle>
                    <AlertDescription>
                        Hadir ke pondok bersama orang tua / wali untuk sowan dan
                        menyelesaikan administrasi di kantor. Bawa nomor
                        registrasi, berkas asli dan fotokopi sesuai persyaratan.
                        Hubungi narahubung untuk mengonfirmasi jadwal kehadiran.
                    </AlertDescription>
                </Alert>
            </PublicState>
        </>
    );
}
