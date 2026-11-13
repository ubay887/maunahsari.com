import { Link, usePage } from '@inertiajs/react';
import { MapPin, MessageSquare, Radar, Users } from 'lucide-react';
import { PortalPage } from '@/components/alumni/portal-page';
import {
    LinkRow,
    Meter,
    RowList,
    Stat,
    StepRow,
} from '@/components/portal/kit';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { alumniLabels } from '@/lib/alumni';
import { directory, map, radar } from '@/routes/alumni';
import { index as contacts } from '@/routes/alumni/contacts';
import { edit as editPrivacy } from '@/routes/alumni/privacy';
import { edit as editProfile } from '@/routes/alumni/profile';

type Props = {
    status: string | null;
    rejectionReason: string | null;
    needsPrivacy: boolean;
    profile: {
        full_name: string;
        photo: string | null;
        angkatan: string | null;
        regency: string | null;
        profession: string | null;
    } | null;
    completeness: { percent: number; missing: string[] } | null;
    stats: { pendingRequests: number; alumniTotal: number } | null;
};

const statusBadge = {
    approved: { variant: 'success-light', label: 'Disetujui' },
    rejected: { variant: 'destructive-light', label: 'Ditolak' },
    pending: { variant: 'warning-light', label: 'Menunggu persetujuan' },
} as const;

function Welcome() {
    const name = usePage<{ auth: { user: { name: string } } }>().props.auth.user
        .name;

    return (
        <Frame spacing="default">
            <FramePanel className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-xl font-semibold tracking-tight break-words">
                        Assalamu&apos;alaikum, {name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Lengkapi profil agar alumni lain dapat menemukan Anda.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" asChild>
                        <Link href={editProfile()}>Isi profil</Link>
                    </Button>
                </div>
            </FramePanel>
        </Frame>
    );
}

function ProfileHero({
    profile,
    status,
    completeness,
}: {
    profile: NonNullable<Props['profile']>;
    status: string | null;
    completeness: NonNullable<Props['completeness']>;
}) {
    const getInitials = useInitials();
    const badge = statusBadge[status as keyof typeof statusBadge];
    const subtitle = [
        profile.profession,
        profile.angkatan ? `Angkatan ${profile.angkatan}` : null,
        profile.regency,
    ].filter(Boolean);

    return (
        <Frame spacing="default">
            <FramePanel className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Avatar className="size-14">
                        {profile.photo && (
                            <AvatarImage src={profile.photo} alt="" />
                        )}
                        <AvatarFallback>
                            {getInitials(profile.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-lg font-semibold tracking-tight break-words">
                            {profile.full_name}
                        </p>
                        {subtitle.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {subtitle.join(' · ')}
                            </p>
                        )}
                        {badge && (
                            <div>
                                <Badge variant={badge.variant}>
                                    {badge.label}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
                {completeness.percent < 100 ? (
                    <div className="flex flex-col gap-3">
                        <Meter
                            label="Kelengkapan profil"
                            valueText={`${completeness.percent}%`}
                            value={completeness.percent}
                        />
                        <div className="flex flex-wrap gap-1">
                            {completeness.missing.slice(0, 4).map((key) => (
                                <Badge key={key} variant="outline">
                                    {alumniLabels[key] ?? key}
                                </Badge>
                            ))}
                        </div>
                        <Button type="button" variant="outline" asChild>
                            <Link href={editProfile()}>
                                {status === 'rejected'
                                    ? 'Perbaiki profil'
                                    : 'Lengkapi profil'}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <Button type="button" variant="outline" asChild>
                        <Link href={editProfile()}>
                            {status === 'rejected'
                                ? 'Perbaiki profil'
                                : 'Ubah profil'}
                        </Link>
                    </Button>
                )}
            </FramePanel>
        </Frame>
    );
}

function Notices({
    status,
    rejectionReason,
    needsPrivacy,
}: Pick<Props, 'status' | 'rejectionReason' | 'needsPrivacy'>) {
    return (
        <>
            {status === 'rejected' && (
                <Alert variant="destructive">
                    <AlertTitle>Profil ditolak</AlertTitle>
                    <AlertDescription>
                        {rejectionReason ??
                            'Perbaiki profil lalu ajukan kembali.'}
                    </AlertDescription>
                </Alert>
            )}
            {needsPrivacy && (
                <Alert variant="warning">
                    <AlertTitle>Pilih pengaturan privasi</AlertTitle>
                    <AlertDescription>
                        <div className="flex flex-col items-start gap-3">
                            <p>
                                Direktori, radar, dan peta terbuka setelah Anda
                                memilih privasi.
                            </p>
                            <Button type="button" size="sm" asChild>
                                <Link href={editPrivacy()}>Pilih privasi</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
            {status === 'pending' && !needsPrivacy && (
                <Alert variant="info">
                    <AlertTitle>Menunggu persetujuan</AlertTitle>
                    <AlertDescription>
                        Pengurus sedang memeriksa profil Anda. Direktori dan
                        radar terbuka setelah disetujui.
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}

function NextSteps({
    status,
    needsPrivacy,
}: Pick<Props, 'status' | 'needsPrivacy'>) {
    return (
        <Frame spacing="default">
            <FrameHeader>
                <FrameTitle>Langkah berikutnya</FrameTitle>
                <FrameDescription>
                    Direktori dan radar terbuka setelah ketiganya selesai.
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <RowList>
                    <StepRow
                        done
                        title="Isi profil"
                        description="Profil sudah diajukan"
                        href={editProfile()}
                    />
                    <StepRow
                        done={!needsPrivacy}
                        title="Pilih privasi"
                        description="Atur tampilan di peta dan direktori"
                        href={editPrivacy()}
                    />
                    <StepRow
                        done={status === 'approved'}
                        title="Persetujuan pengurus"
                        description={
                            status === 'approved'
                                ? 'Profil sudah disetujui'
                                : 'Menunggu pengurus memeriksa profil'
                        }
                    />
                </RowList>
            </FramePanel>
        </Frame>
    );
}

function Explore({ stats }: { stats: NonNullable<Props['stats']> }) {
    return (
        <>
            <Frame spacing="default">
                <FramePanel className="grid grid-cols-2 gap-4">
                    <Stat
                        label="Permintaan menunggu"
                        value={stats.pendingRequests}
                        hint={
                            stats.pendingRequests > 0
                                ? 'Perlu jawaban Anda'
                                : 'Tidak ada yang tertunda'
                        }
                        href={contacts()}
                    />
                    <Stat
                        label="Alumni terdaftar"
                        value={stats.alumniTotal}
                        hint="Dapat ditemukan"
                        href={directory()}
                    />
                </FramePanel>
            </Frame>
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Jelajahi</FrameTitle>
                </FrameHeader>
                <FramePanel>
                    <RowList>
                        <LinkRow
                            href={radar()}
                            icon={Radar}
                            title="Radar alumni"
                            description="Alumni di sekitar wilayah Anda"
                        />
                        <LinkRow
                            href={directory()}
                            icon={Users}
                            title="Direktori"
                            description="Cari menurut angkatan dan wilayah"
                        />
                        <LinkRow
                            href={map()}
                            icon={MapPin}
                            title="Peta sebaran"
                            description="Sebaran alumni per wilayah"
                        />
                        <LinkRow
                            href={contacts()}
                            icon={MessageSquare}
                            title="Permintaan kontak"
                            description="Masuk dan keluar"
                        />
                    </RowList>
                </FramePanel>
            </Frame>
        </>
    );
}

export default function AlumniHome({
    status,
    rejectionReason,
    needsPrivacy,
    profile,
    completeness,
    stats,
}: Props) {
    return (
        <PortalPage
            title="Beranda"
            description="Status profil dan langkah berikutnya."
        >
            {profile === null || completeness === null ? (
                <Welcome />
            ) : (
                <>
                    <ProfileHero
                        profile={profile}
                        status={status}
                        completeness={completeness}
                    />
                    <Notices
                        status={status}
                        rejectionReason={rejectionReason}
                        needsPrivacy={needsPrivacy}
                    />
                    {stats ? (
                        <Explore stats={stats} />
                    ) : (
                        <NextSteps
                            status={status}
                            needsPrivacy={needsPrivacy}
                        />
                    )}
                </>
            )}
        </PortalPage>
    );
}
