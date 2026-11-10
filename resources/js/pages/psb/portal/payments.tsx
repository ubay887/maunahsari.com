import { MessageCircle, ReceiptText, Wallet } from 'lucide-react';
import { PortalPage } from '@/components/alumni/portal-page';
import { EmptyState } from '@/components/empty-state';
import { LinkRow, RowList } from '@/components/portal/kit';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { dateTime, rupiah } from '@/lib/psb';
import type { PortalApplicant, PortalPayment } from '@/types/psb';

export default function PortalPayments({
    applicant,
    payments,
}: {
    applicant: PortalApplicant;
    payments: { total: number; items: PortalPayment[] };
}) {
    return (
        <PortalPage
            title="Biaya"
            description="Catatan pembayaran yang dicatat pengurus."
        >
            <Frame spacing="default">
                <FramePanel className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        Total tercatat
                    </span>
                    <span className="text-3xl font-semibold tracking-tight tabular-nums">
                        {rupiah(payments.total)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {payments.items.length} pembayaran
                    </span>
                </FramePanel>
            </Frame>
            {(applicant.fee_url || applicant.contact) && (
                <Frame spacing="default">
                    <FrameHeader>
                        <FrameTitle>Informasi biaya</FrameTitle>
                    </FrameHeader>
                    <FramePanel>
                        <RowList>
                            {applicant.fee_url && (
                                <LinkRow
                                    external
                                    href={applicant.fee_url}
                                    icon={Wallet}
                                    title="Rincian biaya"
                                    description="Buka daftar biaya pendaftaran"
                                />
                            )}
                            {applicant.contact && (
                                <LinkRow
                                    external
                                    href={`https://wa.me/${applicant.contact}`}
                                    icon={MessageCircle}
                                    title="WhatsApp narahubung"
                                    description="Tanya biaya dan tata cara bayar"
                                />
                            )}
                        </RowList>
                    </FramePanel>
                </Frame>
            )}
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Riwayat pembayaran</FrameTitle>
                    <FrameDescription>Terbaru di paling atas.</FrameDescription>
                </FrameHeader>
                {payments.items.length === 0 ? (
                    <FramePanel>
                        <EmptyState
                            icon={ReceiptText}
                            title="Belum ada catatan pembayaran"
                            description="Pembayaran dicatat pengurus setelah administrasi diselesaikan di kantor."
                        />
                    </FramePanel>
                ) : (
                    payments.items.map((payment) => (
                        <FramePanel
                            key={payment.id}
                            className="flex flex-col gap-1"
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-base font-semibold tabular-nums">
                                    {rupiah(payment.amount)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {dateTime(payment.paid_at)}
                                </span>
                            </div>
                            {payment.note && (
                                <p className="text-sm break-words text-muted-foreground">
                                    {payment.note}
                                </p>
                            )}
                        </FramePanel>
                    ))
                )}
            </Frame>
            <Alert variant="info">
                <AlertTitle>Pembayaran dilakukan di kantor</AlertTitle>
                <AlertDescription>
                    Portal ini hanya menampilkan catatan. Pembayaran tidak dapat
                    dilakukan secara daring; hubungi narahubung untuk informasi
                    biaya dan tata cara pembayaran.
                </AlertDescription>
            </Alert>
        </PortalPage>
    );
}
