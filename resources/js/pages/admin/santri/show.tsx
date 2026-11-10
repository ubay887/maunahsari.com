import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    MessageCircle,
    UserRound,
} from 'lucide-react';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FrameDescription,
    FramePanel,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/psb';
import { index, photo } from '@/routes/admin/santri';
import { show as applicant } from '@/routes/admin/psb/applicants';
import type { Santri } from '@/types/psb';

export default function Show({
    santri,
    hasPhoto,
}: {
    santri: Santri;
    hasPhoto: boolean;
}) {
    return (
        <PsbAdminPage
            module="santri"
            title={santri.full_name}
            description="Biodata, program pendidikan, dan informasi wali santri."
            actions={
                <Button type="button" variant="outline" asChild>
                    <Link href={index()}>
                        <ArrowLeft aria-hidden="true" />
                        Daftar santri
                    </Link>
                </Button>
            }
        >
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Biodata santri</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                {[
                                    ['Nama lengkap', santri.full_name],
                                    ['NIK', santri.nik ?? 'Belum dilengkapi'],
                                    ['Nama panggilan', santri.nickname || '—'],
                                    [
                                        'Jenis kelamin',
                                        santri.gender === 'male'
                                            ? 'Laki-laki'
                                            : 'Perempuan',
                                    ],
                                    ['Tempat lahir', santri.birth_place],
                                    [
                                        'Tanggal lahir',
                                        new Intl.DateTimeFormat('id-ID', {
                                            dateStyle: 'long',
                                            timeZone: 'Asia/Jakarta',
                                        }).format(new Date(santri.birth_date)),
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex min-w-0 flex-col gap-1"
                                    >
                                        <dt className="text-xs text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="break-words">{value}</dd>
                                    </div>
                                ))}
                                <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                                    <dt className="text-xs text-muted-foreground">
                                        Alamat
                                    </dt>
                                    <dd className="break-words whitespace-pre-line">
                                        {formatAddress(santri)}
                                    </dd>
                                </div>
                            </dl>
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Informasi wali</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col items-start gap-4">
                            <dl className="grid w-full gap-4 sm:grid-cols-2">
                                <div className="flex min-w-0 flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        Nama wali
                                    </dt>
                                    <dd className="break-words">
                                        {santri.guardian_name}
                                    </dd>
                                </div>
                                <div className="flex min-w-0 flex-col gap-1">
                                    <dt className="text-xs text-muted-foreground">
                                        WhatsApp wali
                                    </dt>
                                    <dd className="break-all tabular-nums">
                                        {santri.guardian_phone}
                                    </dd>
                                </div>
                            </dl>
                            <Button type="button" variant="outline" asChild>
                                <a
                                    href={`https://wa.me/${santri.guardian_phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle aria-hidden="true" />
                                    Hubungi wali
                                    <ArrowUpRight aria-hidden="true" />
                                </a>
                            </Button>
                        </FramePanel>
                    </Frame>
                </div>
                <Frame spacing="default" className="min-w-0">
                    <FrameHeader>
                        <FrameTitle>Informasi pendidikan</FrameTitle>
                        <FrameDescription>
                            Program dan status kepesantrenan.
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel className="flex flex-col items-start gap-4">
                        {hasPhoto ? (
                            <img
                                src={photo.url(santri.id)}
                                alt={`Foto ${santri.full_name}`}
                                className="aspect-[3/4] w-28 object-contain"
                            />
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <UserRound
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                Foto belum tersedia
                            </div>
                        )}
                        <Badge
                            variant={
                                santri.is_active
                                    ? 'success-light'
                                    : 'warning-light'
                            }
                        >
                            {santri.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        <dl className="grid w-full gap-4">
                            {[
                                ['Program', santri.program.name],
                                [
                                    'Pondok',
                                    santri.pondok === 'putra'
                                        ? 'Putra'
                                        : 'Putri',
                                ],
                                [
                                    'Jenis santri',
                                    santri.residence_type === 'mukim'
                                        ? 'Mukim'
                                        : 'Nduduk',
                                ],
                                ['Tahun masuk', String(santri.entry_year)],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex min-w-0 flex-col gap-1"
                                >
                                    <dt className="text-xs text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="break-words">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <Button type="button" variant="outline" asChild>
                            <Link href={applicant(santri.applicant_id)}>
                                Lihat pendaftaran PSB
                                <ArrowUpRight aria-hidden="true" />
                            </Link>
                        </Button>
                    </FramePanel>
                </Frame>
            </div>
        </PsbAdminPage>
    );
}
