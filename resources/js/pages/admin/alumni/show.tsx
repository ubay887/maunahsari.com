import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Pencil, UserRound } from 'lucide-react';
import { DetailList, type DetailItem } from '@/components/admin/detail-list';
import { AlumniAdminPage } from '@/components/alumni/admin-page';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { alumniLabels } from '@/lib/alumni';
import { formatDate } from '@/lib/format';
import { edit, index } from '@/routes/admin/alumni';
import { show as santriShow } from '@/routes/admin/santri';
import type { AlumniProfile } from '@/types/alumni';

const visibilityLabels: Record<string, string> = {
    private: 'Privat',
    alumni: 'Alumni',
    public: 'Publik',
};

function label(value: string | null | undefined, empty = '—') {
    return value ? (alumniLabels[value] ?? value) : empty;
}

function list(values: string[] | null | undefined) {
    return values?.length
        ? values.map((value) => label(value)).join(', ')
        : null;
}

export default function Show({
    profile,
    account,
    santri,
    verifiedBy,
}: {
    profile: AlumniProfile;
    account: { id: number; name: string; email: string } | null;
    santri: { id: number; full_name: string } | null;
    verifiedBy: string | null;
}) {
    const biodata: DetailItem[] = [
        { label: 'Nama lengkap', value: profile.full_name },
        { label: 'Nama panggilan / lakop', value: profile.nickname },
        { label: 'Jenis kelamin', value: label(profile.gender) },
        { label: 'Tempat lahir', value: profile.birth_place },
        { label: 'Tanggal lahir', value: profile.birth_date },
        { label: 'Angkatan', value: profile.angkatan },
        { label: 'Pondok', value: label(profile.pondok) },
        { label: 'Program', value: profile.program },
        { label: 'Status kesantrian', value: label(profile.alumni_status) },
        { label: 'Tahun masuk', value: profile.entry_year },
        { label: 'Tahun keluar', value: profile.leave_year },
        { label: 'Provinsi', value: profile.province },
        { label: 'Kota/kabupaten', value: profile.regency },
        { label: 'WhatsApp', value: profile.phone_whatsapp },
    ];
    const career: DetailItem[] = [
        { label: 'Profesi', value: profile.profession },
        { label: 'Organisasi', value: profile.organization },
        { label: 'Bidang', value: profile.field },
        { label: 'Keahlian', value: profile.skills?.join(', ') },
        { label: 'Kesediaan', value: list(profile.open_to) },
        { label: 'Bio', value: profile.bio, wide: true },
        {
            label: 'Tautan sosial',
            wide: true,
            value: profile.social_links
                ? Object.entries(profile.social_links).map(([key, url]) => (
                      <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block break-all underline underline-offset-4"
                      >
                          {key}
                      </a>
                  ))
                : null,
        },
    ];

    return (
        <AlumniAdminPage
            title={profile.full_name ?? 'Detail alumni'}
            description="Biodata, pekerjaan, verifikasi, dan pengaturan privasi alumni."
            actions={
                <>
                    <Button type="button" variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft aria-hidden />
                            Daftar alumni
                        </Link>
                    </Button>
                    <Button type="button" asChild>
                        <Link href={edit(profile.id)}>
                            <Pencil aria-hidden />
                            Edit
                        </Link>
                    </Button>
                </>
            }
        >
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Biodata</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList items={biodata} />
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Pekerjaan dan keahlian</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList items={career} />
                        </FramePanel>
                    </Frame>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Verifikasi</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            {profile.photo ? (
                                <img
                                    src={profile.photo}
                                    alt={`Foto ${profile.full_name}`}
                                    className="aspect-[3/4] w-28 object-cover"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserRound aria-hidden className="size-4" />
                                    Foto belum tersedia
                                </div>
                            )}
                            <Badge
                                className="self-start"
                                variant={
                                    profile.verification_status === 'approved'
                                        ? 'success-light'
                                        : profile.verification_status ===
                                            'rejected'
                                          ? 'destructive-light'
                                          : 'warning-light'
                                }
                            >
                                {label(profile.verification_status)}
                            </Badge>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Diverifikasi',
                                        value: profile.verified_at
                                            ? `${formatDate(profile.verified_at)}${verifiedBy ? ` oleh ${verifiedBy}` : ''}`
                                            : null,
                                    },
                                    {
                                        label: 'Alasan penolakan',
                                        value: profile.rejection_reason,
                                    },
                                    {
                                        label: 'Sumber data',
                                        value: label(profile.source),
                                    },
                                    {
                                        label: 'Akun alumni',
                                        value: account
                                            ? `${account.name} (${account.email})`
                                            : 'Belum ada akun',
                                    },
                                ]}
                            />
                            {santri && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="self-start"
                                    asChild
                                >
                                    <Link href={santriShow(santri.id)}>
                                        Data santri: {santri.full_name}
                                        <ArrowUpRight aria-hidden />
                                    </Link>
                                </Button>
                            )}
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Privasi</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: 'Izin peta',
                                        value: label(
                                            profile.map_mode,
                                            'Belum memilih',
                                        ),
                                    },
                                    {
                                        label: 'Izin direktori',
                                        value:
                                            profile.directory_visible === null
                                                ? 'Belum memilih'
                                                : profile.directory_visible
                                                  ? 'Izinkan tampil'
                                                  : 'Tidak ditampilkan',
                                    },
                                    ...Object.entries(
                                        profile.field_visibility ?? {},
                                    ).map(([field, visibility]) => ({
                                        label: label(field, field),
                                        value:
                                            visibilityLabels[visibility] ??
                                            visibility,
                                    })),
                                ]}
                            />
                        </FramePanel>
                    </Frame>
                </div>
            </div>
        </AlumniAdminPage>
    );
}
