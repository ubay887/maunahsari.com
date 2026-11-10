import { Link } from '@inertiajs/react';
import { ClipboardX, MessageCircle, ReceiptText, Wallet } from 'lucide-react';
import { PortalPage } from '@/components/alumni/portal-page';
import { EmptyState } from '@/components/empty-state';
import {
    LinkRow,
    Meter,
    RowList,
    StepRow,
    StepTrack,
} from '@/components/portal/kit';
import { DocumentStatusBadge } from '@/components/psb/document-status-badge';
import { StatusBadge } from '@/components/psb/status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { dateTime, statusMessages } from '@/lib/psb';
import { index as psbIndex } from '@/routes/psb';
import { receipt } from '@/routes/psb/portal';
import { index as documentsIndex } from '@/routes/psb/portal/documents';
import { index as paymentsIndex } from '@/routes/psb/portal/payments';
import { edit as editProfile } from '@/routes/psb/portal/profile';
import type {
    ApplicantStatus,
    PortalApplicant,
    PortalDocument,
    PortalHistory,
} from '@/types/psb';

const trackSteps = ['Terdaftar', 'Terverifikasi', 'Diterima'];

const trackIndex: Record<ApplicantStatus, number> = {
    registered: 0,
    verified: 1,
    accepted: 2,
    rejected: -1,
    cancelled: -1,
};

function Facts({ applicant }: { applicant: PortalApplicant }) {
    const facts = [
        ['Program', applicant.program],
        ['Pondok', applicant.pondok],
        ['Jenis santri', applicant.residence_type],
        [
            'Kunjungan',
            applicant.visit_scheduled_at
                ? dateTime(applicant.visit_scheduled_at)
                : 'Belum dijadwalkan',
        ],
    ];

    return (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {facts.map(([label, value]) => (
                <div key={label} className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="break-words">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function StatusHero({
    applicant,
    uploaded,
    total,
}: {
    applicant: PortalApplicant;
    uploaded: number;
    total: number;
}) {
    const needsDocuments = applicant.can_edit && uploaded < total;
    const finished = ['rejected', 'cancelled'].includes(applicant.status);

    return (
        <Frame spacing="default">
            <FramePanel className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={applicant.status} />
                    <span className="text-xs text-muted-foreground">
                        {applicant.period}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-xl font-semibold tracking-tight break-words">
                        {applicant.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                        No. {applicant.registration_number}
                    </p>
                </div>
                {!finished && (
                    <StepTrack
                        label="Tahap pendaftaran"
                        steps={trackSteps}
                        current={trackIndex[applicant.status]}
                    />
                )}
                <p className="text-sm">{statusMessages[applicant.status]}</p>
                {applicant.decision_reason && (
                    <Alert variant="destructive">
                        <AlertTitle>Alasan</AlertTitle>
                        <AlertDescription>
                            {applicant.decision_reason}
                        </AlertDescription>
                    </Alert>
                )}
                <Facts applicant={applicant} />
                <div className="flex flex-col gap-2 sm:flex-row">
                    {needsDocuments ? (
                        <Button type="button" className="sm:w-auto" asChild>
                            <Link href={documentsIndex()}>Lengkapi berkas</Link>
                        </Button>
                    ) : (
                        <Button type="button" className="sm:w-auto" asChild>
                            <Link href={receipt()}>Lihat bukti</Link>
                        </Button>
                    )}
                    {applicant.can_edit && (
                        <Button type="button" variant="outline" asChild>
                            <Link href={editProfile()}>Perbaiki data</Link>
                        </Button>
                    )}
                </div>
            </FramePanel>
        </Frame>
    );
}

function NextSteps({
    applicant,
    uploaded,
    total,
}: {
    applicant: PortalApplicant;
    uploaded: number;
    total: number;
}) {
    return (
        <Frame spacing="default">
            <FrameHeader>
                <FrameTitle>Langkah berikutnya</FrameTitle>
                <FrameDescription>
                    Selesaikan satu per satu, urutannya bebas.
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <RowList>
                    <StepRow
                        done={uploaded === total}
                        title="Lengkapi berkas"
                        description={`${uploaded} dari ${total} berkas terunggah`}
                        href={documentsIndex()}
                    />
                    <StepRow
                        done={!applicant.can_edit}
                        title="Periksa data pendaftaran"
                        description={
                            applicant.can_edit
                                ? 'Data bisa diperbaiki sampai diverifikasi'
                                : 'Data terkunci setelah diverifikasi'
                        }
                        href={editProfile()}
                    />
                    <StepRow
                        done={applicant.status !== 'registered'}
                        title="Verifikasi pengurus"
                        description={
                            applicant.status === 'registered'
                                ? 'Menunggu pengurus memeriksa berkas'
                                : 'Berkas sudah diperiksa'
                        }
                    />
                    <StepRow
                        done={applicant.status === 'accepted'}
                        title="Kunjungan dan sowan"
                        description={
                            applicant.visit_scheduled_at
                                ? dateTime(applicant.visit_scheduled_at)
                                : 'Hubungi narahubung untuk menjadwalkan'
                        }
                    />
                </RowList>
            </FramePanel>
        </Frame>
    );
}

function DocumentSummary({
    applicant,
    documents,
}: {
    applicant: PortalApplicant;
    documents: PortalDocument[];
}) {
    const verified = documents.filter((item) => item.is_verified).length;

    return (
        <Frame spacing="default">
            <FrameHeader>
                <FrameTitle>Berkas</FrameTitle>
            </FrameHeader>
            <FramePanel className="flex flex-col gap-4">
                <Meter
                    label="Terverifikasi"
                    valueText={`${verified} dari ${documents.length}`}
                    value={(verified / Math.max(documents.length, 1)) * 100}
                />
                <ul className="flex flex-col gap-3">
                    {documents.map((document) => (
                        <li
                            key={document.type}
                            className="flex items-center justify-between gap-2 text-sm"
                        >
                            <span className="min-w-0 truncate">
                                {document.label}
                            </span>
                            <DocumentStatusBadge document={document} />
                        </li>
                    ))}
                </ul>
                <Button type="button" variant="outline" asChild>
                    <Link href={documentsIndex()}>
                        {applicant.can_edit ? 'Kelola berkas' : 'Lihat berkas'}
                    </Link>
                </Button>
            </FramePanel>
        </Frame>
    );
}

function Shortcuts({ applicant }: { applicant: PortalApplicant }) {
    return (
        <Frame spacing="default">
            <FrameHeader>
                <FrameTitle>Pintasan</FrameTitle>
            </FrameHeader>
            <FramePanel>
                <RowList>
                    <LinkRow
                        href={receipt()}
                        icon={ReceiptText}
                        title="Bukti pendaftaran"
                        description="Simpan atau cetak untuk administrasi"
                    />
                    <LinkRow
                        href={paymentsIndex()}
                        icon={Wallet}
                        title="Biaya dan pembayaran"
                        description="Catatan pembayaran dari pengurus"
                    />
                    {applicant.contact && (
                        <LinkRow
                            external
                            href={`https://wa.me/${applicant.contact}`}
                            icon={MessageCircle}
                            title="WhatsApp narahubung"
                            description="Tanya jadwal dan administrasi"
                        />
                    )}
                </RowList>
            </FramePanel>
        </Frame>
    );
}

function History({ history }: { history: PortalHistory[] }) {
    return (
        <Frame spacing="default">
            <FrameHeader>
                <FrameTitle>Riwayat status</FrameTitle>
            </FrameHeader>
            <FramePanel>
                {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada riwayat status.
                    </p>
                ) : (
                    <ol className="flex flex-col gap-3">
                        {[...history].reverse().map((item, index) => (
                            <li
                                key={`${item.status}-${index}`}
                                className="flex items-center justify-between gap-3 text-sm"
                            >
                                <span
                                    className={
                                        index === 0
                                            ? 'font-medium'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    {item.status_label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {dateTime(item.at)}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </FramePanel>
        </Frame>
    );
}

export default function PortalHome({
    applicant,
    documents,
    history,
}: {
    applicant: PortalApplicant | null;
    documents: PortalDocument[];
    history: PortalHistory[];
}) {
    if (applicant === null) {
        return (
            <PortalPage
                title="Beranda"
                description="Status pendaftaran dan langkah berikutnya."
            >
                <EmptyState
                    icon={ClipboardX}
                    title="Data pendaftaran tidak ditemukan"
                    description="Akun ini belum terhubung ke pendaftaran. Hubungi narahubung PSB atau daftar kembali."
                    action={
                        <Button type="button" asChild>
                            <Link href={psbIndex()}>Informasi PSB</Link>
                        </Button>
                    }
                />
            </PortalPage>
        );
    }

    const uploaded = documents.filter((item) => item.id !== null).length;
    const open = !['rejected', 'cancelled'].includes(applicant.status);

    return (
        <PortalPage
            title="Beranda"
            description={`Assalamu'alaikum, ${applicant.guardian_name}`}
        >
            <StatusHero
                applicant={applicant}
                uploaded={uploaded}
                total={documents.length}
            />
            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                {open && (
                    <NextSteps
                        applicant={applicant}
                        uploaded={uploaded}
                        total={documents.length}
                    />
                )}
                <DocumentSummary applicant={applicant} documents={documents} />
                <Shortcuts applicant={applicant} />
                <History history={history} />
            </div>
        </PortalPage>
    );
}
