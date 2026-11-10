import { Deferred, Link, router, usePage } from '@inertiajs/react';
import { EmptyState } from '@/components/empty-state';
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    ClipboardList,
    FilePenLine,
    GraduationCap,
    Plus,
    RefreshCw,
    UserCheck,
    UserRound,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { InfiniteFeed } from '@/components/admin/infinite-feed';
import { StatusBadge } from '@/components/psb/status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { dateTime } from '@/lib/psb';
import { dashboard, home } from '@/routes';
import {
    index as applicants,
    create as createApplicant,
    show as showApplicant,
} from '@/routes/admin/psb/applicants';
import { index as periods } from '@/routes/admin/psb/periods';
import { index as santris } from '@/routes/admin/santri';
import { edit as editAlumni, index as alumniList } from '@/routes/admin/alumni';
import { index as alumniImport } from '@/routes/admin/alumni/import';
import {
    index as articles,
    create as createArticle,
} from '@/routes/admin/articles';
import {
    index as events,
    create as createEvent,
    edit as editEvent,
} from '@/routes/admin/events';
import { edit as editProfile } from '@/routes/profile';
import type {
    AgendaEvent,
    DashboardOverview,
    QueuedAlumni,
    RecentApplicant,
} from '@/types/dashboard';

function OverviewSkeleton() {
    return (
        <div
            role="status"
            aria-label="Memuat ringkasan dashboard"
            className="flex min-w-0 flex-col gap-4"
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <Frame key={index} spacing="default">
                        <FramePanel className="flex flex-col gap-3">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-36" />
                        </FramePanel>
                    </Frame>
                ))}
            </div>
            {Array.from({ length: 2 }, (_, row) => (
                <div key={row} className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 2 }, (_, index) => (
                        <Frame key={index} spacing="default">
                            <FrameHeader>
                                <Skeleton className="h-4 w-40" />
                            </FrameHeader>
                            <FramePanel className="p-0">
                                <Skeleton className="h-80 w-full rounded-none" />
                            </FramePanel>
                        </Frame>
                    ))}
                </div>
            ))}
        </div>
    );
}

const feedLink =
    'group flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary';

function ApplicantRow({ applicant }: { applicant: RecentApplicant }) {
    return (
        <Link href={showApplicant(applicant.id)} className={feedLink}>
            <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                <span className="font-medium break-words group-hover:underline">
                    {applicant.full_name}
                </span>
                <span className="text-xs break-words text-muted-foreground">
                    {applicant.registration_number} / {applicant.program_name}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <StatusBadge status={applicant.status} />
                <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                />
            </div>
        </Link>
    );
}

function EventRow({ event }: { event: AgendaEvent }) {
    return (
        <Link href={editEvent(event.id)} className={feedLink}>
            <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                <span className="font-medium break-words group-hover:underline">
                    {event.title}
                </span>
                <span className="text-xs text-muted-foreground">
                    {dateTime(event.start_at)}
                </span>
            </div>
            <Badge
                variant={
                    event.phase === 'ongoing' ? 'success-light' : 'info-light'
                }
            >
                {event.phase === 'ongoing' ? 'Berlangsung' : 'Akan datang'}
            </Badge>
        </Link>
    );
}

function AlumniRow({ profile }: { profile: QueuedAlumni }) {
    return (
        <Link href={editAlumni(profile.id)} className={feedLink}>
            <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                <span className="font-medium break-words group-hover:underline">
                    {profile.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                    {profile.angkatan
                        ? `Angkatan ${profile.angkatan}`
                        : 'Angkatan belum diisi'}
                    {profile.created_at &&
                        ` · diajukan ${dateTime(profile.created_at)}`}
                </span>
            </div>
            <ArrowRight
                aria-hidden="true"
                className="size-4 text-muted-foreground"
            />
        </Link>
    );
}

function Overview({ data }: { data: DashboardOverview }) {
    const {
        feedPageSize,
        psb,
        articles: publication,
        events: agenda,
        alumni,
    } = data;
    const alumniQueue = alumniList({
        query: { verification_status: 'pending' },
    });
    const applicantList = applicants({
        query: { registration_period_id: psb?.period?.id },
    });
    const metrics = psb
        ? [
              {
                  label: 'Pendaftar periode ini',
                  value: psb.totalApplicants,
                  description: 'Seluruh status pendaftaran',
                  href: applicantList,
                  icon: ClipboardList,
              },
              {
                  label: 'Perlu verifikasi',
                  value: psb.pendingApplicants,
                  description: 'Pendaftar berstatus terdaftar',
                  href: applicants({
                      query: {
                          registration_period_id: psb.period?.id,
                          status: 'registered',
                      },
                  }),
                  icon: UserRound,
              },
              {
                  label: 'Pendaftar diterima',
                  value: psb.acceptedApplicants,
                  description: 'Penerimaan pada periode ini',
                  href: applicants({
                      query: {
                          registration_period_id: psb.period?.id,
                          status: 'accepted',
                      },
                  }),
                  icon: UserCheck,
              },
              {
                  label: 'Santri aktif',
                  value: psb.activeSantri,
                  description: 'Dari seluruh tahun masuk',
                  href: santris(),
                  icon: GraduationCap,
              },
          ]
        : [];

    return (
        <div className="flex min-w-0 flex-col gap-4">
            {psb && (
                <section
                    aria-label="Ringkasan penerimaan dan santri"
                    className="flex min-w-0 flex-col gap-4"
                >
                    {psb.period ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm font-semibold tracking-tight">
                                    {psb.period.name}
                                </h2>
                                <Badge
                                    variant={
                                        psb.period.is_open
                                            ? 'success-light'
                                            : 'warning-light'
                                    }
                                >
                                    {psb.period.is_open
                                        ? 'Pendaftaran dibuka'
                                        : 'Pendaftaran ditutup'}
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Tahun ajaran {psb.period.academic_year}
                            </span>
                        </div>
                    ) : (
                        <Alert variant="info">
                            <AlertTitle>Periode PSB belum tersedia</AlertTitle>
                            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                                <span>
                                    Siapkan periode untuk memulai penerimaan
                                    santri.
                                </span>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={periods()}>
                                        Atur periode
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {metrics.map(
                            ({
                                label,
                                value,
                                description,
                                href,
                                icon: Icon,
                            }) => (
                                <Frame
                                    key={label}
                                    spacing="default"
                                    className="min-w-0"
                                >
                                    <FramePanel className="relative flex flex-col gap-2 transition-colors hover:bg-accent">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link
                                                href={href}
                                                className="text-sm font-medium after:absolute after:inset-0"
                                            >
                                                {label}
                                            </Link>
                                            <Icon
                                                aria-hidden="true"
                                                className="size-4 text-muted-foreground"
                                            />
                                        </div>
                                        <span className="text-2xl font-semibold tracking-tight tabular-nums">
                                            {value.toLocaleString('id-ID')}
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            {description}
                                        </p>
                                    </FramePanel>
                                </Frame>
                            ),
                        )}
                    </div>
                </section>
            )}
            {(psb || agenda !== null) && (
                <div
                    className={
                        psb && agenda !== null
                            ? 'grid min-w-0 gap-4 lg:grid-cols-2'
                            : 'grid min-w-0 gap-4'
                    }
                >
                    {psb && (
                        <Frame spacing="default" className="min-w-0">
                            <FrameHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <FrameTitle>Pendaftar terbaru</FrameTitle>
                                    <FrameDescription>
                                        Lima pendaftaran terakhir pada periode
                                        ini.
                                    </FrameDescription>
                                </div>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={applicantList}>
                                        Semua pendaftar
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </FrameHeader>
                            <FramePanel className="p-0">
                                <InfiniteFeed
                                    feed="applicants"
                                    label="Daftar pendaftar terbaru"
                                    items={psb.recentApplicants}
                                    pageSize={feedPageSize}
                                    renderItem={(applicant) => (
                                        <ApplicantRow applicant={applicant} />
                                    )}
                                    empty={
                                        <EmptyState
                                            title="Belum ada pendaftar"
                                            description="Pendaftaran baru akan ditampilkan di sini."
                                            action={
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={createApplicant()}
                                                    >
                                                        <Plus aria-hidden="true" />
                                                        Tambah pendaftar
                                                    </Link>
                                                </Button>
                                            }
                                        />
                                    }
                                />
                            </FramePanel>
                        </Frame>
                    )}
                    {agenda !== null && (
                        <Frame spacing="default" className="min-w-0">
                            <FrameHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <FrameTitle>Event terdekat</FrameTitle>
                                    <FrameDescription>
                                        Kegiatan yang berlangsung atau akan
                                        dimulai.
                                    </FrameDescription>
                                </div>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={events()}>
                                        Semua event
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </FrameHeader>
                            <FramePanel className="p-0">
                                <InfiniteFeed
                                    feed="events"
                                    label="Daftar event terdekat"
                                    items={agenda}
                                    pageSize={feedPageSize}
                                    renderItem={(event) => (
                                        <EventRow event={event} />
                                    )}
                                    empty={
                                        <EmptyState
                                            title="Belum ada event terdekat"
                                            description="Tambahkan event untuk menyiapkan publikasi berikutnya."
                                            action={
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link href={createEvent()}>
                                                        <Plus aria-hidden="true" />
                                                        Buat event
                                                    </Link>
                                                </Button>
                                            }
                                        />
                                    }
                                />
                            </FramePanel>
                        </Frame>
                    )}
                </div>
            )}
            {(alumni || publication) && (
                <div
                    className={
                        alumni && publication
                            ? 'grid min-w-0 gap-4 lg:grid-cols-2'
                            : 'grid min-w-0 gap-4'
                    }
                >
                    {alumni && (
                        <Frame spacing="default" className="min-w-0">
                            <FrameHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <FrameTitle>
                                            Antrean verifikasi alumni
                                        </FrameTitle>
                                        {alumni.pending > 0 && (
                                            <Badge variant="warning-light">
                                                {alumni.pending.toLocaleString(
                                                    'id-ID',
                                                )}{' '}
                                                menunggu
                                            </Badge>
                                        )}
                                    </div>
                                    <FrameDescription>
                                        Profil yang paling lama menunggu
                                        keputusan admin.
                                    </FrameDescription>
                                </div>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={alumniQueue}>
                                        Semua antrean
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </FrameHeader>
                            <FramePanel className="p-0">
                                <InfiniteFeed
                                    feed="alumni"
                                    label="Antrean verifikasi alumni"
                                    items={alumni.queue}
                                    pageSize={feedPageSize}
                                    renderItem={(profile) => (
                                        <AlumniRow profile={profile} />
                                    )}
                                    empty={
                                        <EmptyState
                                            title="Tidak ada antrean verifikasi"
                                            description={
                                                alumni.total === 0
                                                    ? 'Belum ada profil alumni. Impor data atau tambahkan secara manual.'
                                                    : 'Semua profil alumni sudah diputuskan.'
                                            }
                                            action={
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            alumni.total === 0
                                                                ? alumniImport()
                                                                : alumniList()
                                                        }
                                                    >
                                                        {alumni.total === 0
                                                            ? 'Impor data alumni'
                                                            : 'Lihat daftar alumni'}
                                                    </Link>
                                                </Button>
                                            }
                                        />
                                    }
                                />
                            </FramePanel>
                        </Frame>
                    )}
                    {publication && (
                        <Frame spacing="default" className="min-w-0">
                            <FrameHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <FrameTitle>Publikasi artikel</FrameTitle>
                                    <FrameDescription>
                                        Ringkasan artikel sesuai hak akses Anda.
                                    </FrameDescription>
                                </div>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={articles()}>
                                        Kelola artikel
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </FrameHeader>
                            <FramePanel className="flex flex-col">
                                {publication.total === 0 ? (
                                    <EmptyState
                                        title="Belum ada artikel"
                                        description="Mulai menulis kabar dan kegiatan pesantren."
                                        action={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href={createArticle()}>
                                                    <FilePenLine aria-hidden="true" />
                                                    Tulis artikel
                                                </Link>
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <dl className="grid grow divide-y divide-border">
                                        {[
                                            [
                                                'Total artikel',
                                                publication.total,
                                            ],
                                            [
                                                'Sudah terbit',
                                                publication.published,
                                            ],
                                            ['Draf', publication.draft],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                                            >
                                                <dt className="text-sm text-muted-foreground">
                                                    {label}
                                                </dt>
                                                <dd className="text-2xl font-semibold tracking-tight tabular-nums">
                                                    {Number(
                                                        value,
                                                    ).toLocaleString('id-ID')}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </FramePanel>
                        </Frame>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Dashboard({
    overview,
}: {
    overview?: DashboardOverview;
}) {
    const { auth, alumniAdminAccess, articleAccess, psbAccess, eventAccess } =
        usePage<{
            alumniAdminAccess?: { canManage: boolean };
            articleAccess?: { canWrite: boolean };
            psbAccess?: { canManage: boolean };
            eventAccess?: { canManage: boolean };
        }>().props;
    const page = useArticlePageState();
    const canManage =
        psbAccess?.canManage ||
        alumniAdminAccess?.canManage ||
        articleAccess?.canWrite ||
        eventAccess?.canManage;
    return (
        <AdminPage
            title="Dashboard"
            description={`Selamat datang, ${auth.user?.name}. Pantau aktivitas dan pekerjaan hari ini.`}
            actions={
                <>
                    {canManage && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={page.loading}
                            onClick={() =>
                                router.reload({ only: ['overview'] })
                            }
                        >
                            <RefreshCw aria-hidden="true" />
                            {page.loading ? 'Memuat…' : 'Perbarui'}
                        </Button>
                    )}
                    {psbAccess?.canManage && (
                        <Button type="button" asChild>
                            <Link href={createApplicant()}>
                                <Plus aria-hidden="true" />
                                Tambah pendaftar
                            </Link>
                        </Button>
                    )}
                </>
            }
        >
            {canManage ? (
                <Deferred
                    data="overview"
                    fallback={<OverviewSkeleton />}
                    rescue={({ reloading }) => (
                        <Alert variant="destructive">
                            <AlertTitle>Ringkasan gagal dimuat</AlertTitle>
                            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                                <span>Coba muat ulang data dashboard.</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={reloading}
                                    onClick={() =>
                                        router.reload({
                                            only: ['overview'],
                                        })
                                    }
                                >
                                    <RefreshCw aria-hidden="true" />
                                    {reloading ? 'Memuat…' : 'Coba lagi'}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                >
                    {({ reloading }) => (
                        <div aria-busy={reloading}>
                            {overview && <Overview data={overview} />}
                        </div>
                    )}
                </Deferred>
            ) : (
                <Frame spacing="default">
                    <FrameHeader>
                        <FrameTitle>Akun Anda</FrameTitle>
                        <FrameDescription>
                            Kelola profil dan preferensi penggunaan aplikasi.
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel>
                        <EmptyState
                            title="Selamat datang di portal pesantren"
                            description="Menu administrasi ditampilkan sesuai hak akses akun Anda."
                            action={
                                <Button type="button" variant="outline" asChild>
                                    <Link href={editProfile()}>
                                        Pengaturan akun
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            }
                        />
                    </FramePanel>
                </Frame>
            )}
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Akses cepat</FrameTitle>
                    <FrameDescription>
                        Buka pekerjaan yang sering digunakan.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-wrap gap-2">
                    {psbAccess?.canManage && (
                        <>
                            <Button type="button" variant="outline" asChild>
                                <Link href={applicants()}>
                                    <ClipboardList aria-hidden="true" />
                                    Pendaftar PSB
                                </Link>
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={santris()}>
                                    <GraduationCap aria-hidden="true" />
                                    Data santri
                                </Link>
                            </Button>
                        </>
                    )}
                    {articleAccess?.canWrite && (
                        <Button type="button" variant="outline" asChild>
                            <Link href={createArticle()}>
                                <FilePenLine aria-hidden="true" />
                                Tulis artikel
                            </Link>
                        </Button>
                    )}
                    {eventAccess?.canManage && (
                        <Button type="button" variant="outline" asChild>
                            <Link href={createEvent()}>
                                <CalendarDays aria-hidden="true" />
                                Buat event
                            </Link>
                        </Button>
                    )}
                    <Button type="button" variant="outline" asChild>
                        <Link href={home()}>
                            <ArrowUpRight aria-hidden="true" />
                            Lihat situs publik
                        </Link>
                    </Button>
                </FramePanel>
            </Frame>
        </AdminPage>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
