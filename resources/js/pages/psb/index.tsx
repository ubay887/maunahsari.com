import { Head, Link } from '@inertiajs/react';
import { Contacts } from '@/components/psb/contacts';
import { ArticleContent } from '@/components/article-content';
import { PublicState } from '@/components/psb/public-state';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { closedMessage, documentLabels } from '@/lib/psb';
import { register } from '@/routes/psb';
import { index as statusIndex } from '@/routes/psb/status';
import type { Period, Program, Quota } from '@/types/psb';
export default function Index({
    period,
    programs,
    quotas,
    canonical,
    infoHtml,
}: {
    period: Period | null;
    programs: Program[];
    quotas: Quota[];
    canonical: string;
    infoHtml?: string | null;
}) {
    const available = quotas.some((quota) => quota.available);
    const title = period?.name ?? 'Penerimaan Santri Baru';
    const description =
        'Informasi program, kuota, persyaratan, dan pendaftaran santri baru.';
    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonical} />
                <link rel="canonical" href={canonical} />
            </Head>
            <PublicState>
                <section className="flex flex-col items-start gap-4">
                    <Badge variant="outline">Penerimaan Santri Baru</Badge>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Mulai dengan mengisi formulir, lalu hadir bersama wali.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {available && (
                            <Button type="button" asChild>
                                <Link href={register()}>
                                    Isi formulir pendaftaran
                                </Link>
                            </Button>
                        )}
                        <Button type="button" variant="outline" asChild>
                            <Link href={statusIndex()}>
                                Cek status pendaftaran
                            </Link>
                        </Button>
                    </div>
                </section>
                {!available && (
                    <Alert variant="warning">
                        <AlertTitle>{closedMessage}</AlertTitle>
                        <AlertDescription>
                            <Contacts period={period} />
                        </AlertDescription>
                    </Alert>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Alur pendaftaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
                            {[
                                'Isi formulir',
                                'Hadir / sowan bersama wali',
                                'Administrasi di kantor',
                                'Verifikasi berkas',
                                'Diterima atau ditolak',
                            ].map((step, index) => (
                                <li key={step} className="flex flex-col gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Langkah {index + 1}
                                    </span>
                                    <span className="font-medium">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>
                <div className="grid items-start gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi dan persyaratan</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {infoHtml ? (
                                <ArticleContent html={infoHtml} />
                            ) : (
                                <p className="text-sm whitespace-pre-line">
                                    {period?.info_note ||
                                        'Informasi rinci belum diumumkan. Hubungi kantor pondok.'}
                                </p>
                            )}
                            <ul className="flex list-inside list-disc flex-col gap-2 text-sm">
                                {Object.values(documentLabels).map((label) => (
                                    <li key={label}>{label}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-muted-foreground">
                                Ijazah dan KK: PDF. Pas foto: JPG, PNG, atau
                                WebP. Maksimal 2 MB per berkas.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Biaya dan narahubung</CardTitle>
                            <CardDescription>
                                Administrasi dibayar langsung di kantor pondok.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {(['putra', 'putri'] as const).map((pondok) => (
                                <div
                                    key={pondok}
                                    className="flex flex-col items-start gap-2"
                                >
                                    <span className="text-sm font-medium capitalize">
                                        Pondok {pondok}
                                    </span>
                                    {period?.[`fee_url_${pondok}`] ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <a
                                                href={
                                                    period[
                                                        `fee_url_${pondok}`
                                                    ] ?? undefined
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Lihat rincian biaya {pondok}
                                            </a>
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Tautan rincian biaya belum diatur.
                                        </p>
                                    )}
                                </div>
                            ))}
                            <Contacts period={period} />
                        </CardContent>
                    </Card>
                </div>
                <section className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-display text-xl font-bold tracking-tight text-primary">
                            Program dan kuota
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Kuota dihitung terpisah untuk putra dan putri.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {programs.map((program) => (
                            <Card key={program.id}>
                                <CardHeader>
                                    <CardTitle>{program.name}</CardTitle>
                                    <CardDescription>
                                        {program.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    {program.requires_hafalan && (
                                        <p className="text-xs text-muted-foreground">
                                            Memerlukan hafalan; cantumkan jumlah
                                            juz pada formulir.
                                        </p>
                                    )}
                                    {(['putra', 'putri'] as const).map(
                                        (pondok) => {
                                            const quota = quotas.find(
                                                (item) =>
                                                    item.program_id ===
                                                        program.id &&
                                                    item.pondok === pondok,
                                            );
                                            return (
                                                <div
                                                    key={pondok}
                                                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-sm font-medium capitalize">
                                                            {pondok} ·{' '}
                                                            <span className="tabular-nums">
                                                                {quota?.remaining ??
                                                                    0}{' '}
                                                                tempat tersisa
                                                            </span>
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                quota?.available
                                                                    ? 'success-light'
                                                                    : quota?.is_open &&
                                                                        quota.remaining ===
                                                                            0
                                                                      ? 'warning-light'
                                                                      : 'destructive-light'
                                                            }
                                                        >
                                                            {quota?.available
                                                                ? 'Tersedia'
                                                                : quota?.is_open &&
                                                                    quota.remaining ===
                                                                        0
                                                                  ? 'Penuh'
                                                                  : 'Ditutup'}
                                                        </Badge>
                                                    </div>
                                                    {quota?.available && (
                                                        <Button
                                                            type="button"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={register({
                                                                    query: {
                                                                        program_id:
                                                                            program.id,
                                                                        gender:
                                                                            pondok ===
                                                                            'putra'
                                                                                ? 'male'
                                                                                : 'female',
                                                                    },
                                                                })}
                                                            >
                                                                Daftar {pondok}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {programs.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-start gap-4">
                                <p className="text-sm">
                                    Program belum diumumkan.
                                </p>
                                <Contacts period={period} />
                                <Button type="button" variant="outline" asChild>
                                    <Link href={statusIndex()}>
                                        Cek status pendaftaran
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </PublicState>
        </>
    );
}
