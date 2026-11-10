import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { PsbAdminPage } from '@/components/psb/admin-page';
import { SelectField } from '@/components/select-field';
import { StatusBadge } from '@/components/psb/status-badge';
import { Badge } from '@/components/reui/badge';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    dateTime,
    localDateTime,
    documentLabels,
    rupiah,
    statusLabels,
    validateDocument,
    formatAddress,
} from '@/lib/psb';
import { index, edit, status, visit } from '@/routes/admin/psb/applicants';
import {
    store as storeDocument,
    destroy as deleteDocument,
} from '@/routes/admin/psb/applicants/documents';
import {
    store as storePayment,
    destroy as deletePayment,
} from '@/routes/admin/psb/applicants/payments';
import { show as showDocument, verify } from '@/routes/admin/psb/documents';
import type {
    Applicant,
    ApplicantDocument,
    ApplicantStatus,
    DocumentType,
} from '@/types/psb';
function DocumentUpload({ applicant }: { applicant: Applicant }) {
    const form = useForm<{ type: DocumentType; document: File | null }>({
        type: 'ijazah',
        document: null,
    });
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.submit(storeDocument(applicant.id), {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => form.reset('document'),
                });
            }}
        >
            <SelectField
                id="document-type"
                label="Jenis berkas"
                value={form.data.type}
                options={Object.entries(documentLabels).map(
                    ([value, label]) => ({ value, label }),
                )}
                onChange={(value) => {
                    form.setData('type', value as DocumentType);
                    form.reset('document');
                    form.clearErrors();
                }}
                error={form.errors.type}
            />
            <Field>
                <FieldLabel htmlFor="document-file">
                    Unggah / ganti berkas
                </FieldLabel>
                <Input
                    key={form.data.type}
                    id="document-file"
                    type="file"
                    required
                    accept={
                        form.data.type === 'pas_foto'
                            ? 'image/jpeg,image/png,image/webp'
                            : 'application/pdf'
                    }
                    onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        const error = file
                            ? validateDocument(file, form.data.type)
                            : null;
                        if (error) {
                            form.setError('document', error);
                            event.target.value = '';
                            form.setData('document', null);
                        } else {
                            form.clearErrors('document');
                            form.setData('document', file);
                        }
                    }}
                />
                <FieldDescription>
                    PDF untuk ijazah/KK; JPG/PNG/WebP untuk pas foto 3x4.
                    Maksimal 2 MB.
                </FieldDescription>
                <InputError message={form.errors.document} />
            </Field>
            <Button
                type="submit"
                disabled={form.processing || !form.data.document}
            >
                Simpan berkas
            </Button>
        </form>
    );
}
export default function Show({ applicant }: { applicant: Applicant }) {
    const { errors: pageErrors } = usePage<{ errors: Record<string, string> }>()
        .props;
    const [preview, setPreview] = useState<ApplicantDocument | null>(null);
    const [decision, setDecision] = useState<ApplicantStatus | null>(null);
    const [deletion, setDeletion] = useState<{
        kind: 'document' | 'payment';
        id: number;
        label: string;
    } | null>(null);
    const [pending, setPending] = useState(false);
    const decisionForm = useForm({
        status: applicant.status,
        decision_reason: '',
    });
    const visitForm = useForm({
        visit_scheduled_at: localDateTime(applicant.visit_scheduled_at),
        visited_at: localDateTime(applicant.visited_at),
        sowan_done_at: localDateTime(applicant.sowan_done_at),
        admin_note: applicant.admin_note ?? '',
    });
    const paymentForm = useForm({ amount: '', paid_at: '', note: '' });
    function choose(value: ApplicantStatus) {
        decisionForm.setData('status', value);
        decisionForm.setData('decision_reason', '');
        decisionForm.clearErrors();
        setDecision(value);
    }
    const transitions: ApplicantStatus[] =
        applicant.status === 'registered'
            ? ['verified', 'rejected', 'cancelled']
            : applicant.status === 'verified'
              ? ['accepted', 'rejected', 'cancelled']
              : applicant.status === 'accepted'
                ? ['cancelled']
                : ['registered'];
    return (
        <PsbAdminPage
            title={applicant.full_name}
            description={applicant.registration_number}
            actions={
                <>
                    <Button type="button" variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft aria-hidden="true" />
                            Daftar pendaftar
                        </Link>
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href={edit(applicant.id)}>
                            <Pencil aria-hidden="true" />
                            Edit biodata
                        </Link>
                    </Button>
                </>
            }
        >
            <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={applicant.status} />
            </div>
            {applicant.decision_reason && (
                <Alert variant="warning">
                    <AlertTitle>Catatan keputusan</AlertTitle>
                    <AlertDescription>
                        {applicant.decision_reason}
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid items-start gap-4 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Biodata dan wali</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                {[
                                    [
                                        'Periode',
                                        applicant.registration_period.name,
                                    ],
                                    ['Program', applicant.program.name],
                                    [
                                        'Pondok / jenis santri',
                                        `${applicant.pondok} / ${applicant.residence_type}`,
                                    ],
                                    [
                                        'Sumber',
                                        applicant.source === 'offline'
                                            ? 'Luring'
                                            : 'Online',
                                    ],
                                    [
                                        'Nama panggilan',
                                        applicant.nickname ?? '—',
                                    ],
                                    [
                                        'Jenis kelamin',
                                        applicant.gender === 'male'
                                            ? 'Laki-laki'
                                            : 'Perempuan',
                                    ],
                                    [
                                        'Tempat / tanggal lahir',
                                        `${applicant.birth_place}, ${applicant.birth_date.slice(0, 10)}`,
                                    ],
                                    [
                                        'NIK',
                                        applicant.nik ?? 'Belum dilengkapi',
                                    ],
                                    ['Alamat', formatAddress(applicant)],
                                    [
                                        'Pendidikan terakhir',
                                        applicant.last_education,
                                    ],
                                    [
                                        'Hafalan',
                                        `${applicant.hafalan_juz ?? 0} juz`,
                                    ],
                                    [
                                        'Bin-nadhor / pegon',
                                        `${applicant.can_read_binnadhor ? 'Bisa' : 'Belum'} / ${applicant.can_write_pegon ? 'Bisa' : 'Belum'}`,
                                    ],
                                    [
                                        'Wali',
                                        `${applicant.guardian_name} (${applicant.guardian_relation})`,
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex flex-col gap-1"
                                    >
                                        <dt className="text-xs text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="break-words">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            <Button type="button" variant="outline" asChild>
                                <a
                                    href={`https://wa.me/${applicant.guardian_phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    WhatsApp wali: {applicant.guardian_phone}
                                </a>
                            </Button>
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Berkas pribadi</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            {(
                                Object.keys(documentLabels) as DocumentType[]
                            ).map((type) => {
                                const document = applicant.documents.find(
                                    (item) => item.type === type,
                                );
                                return (
                                    <div
                                        key={type}
                                        className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <span className="font-medium">
                                                {documentLabels[type]}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {document?.original_name ??
                                                    'Belum diunggah'}
                                            </span>
                                            <Badge
                                                variant={
                                                    document?.is_verified
                                                        ? 'success-light'
                                                        : 'warning-light'
                                                }
                                            >
                                                {document?.is_verified
                                                    ? 'Terverifikasi'
                                                    : document
                                                      ? 'Belum diverifikasi'
                                                      : 'Belum tersedia'}
                                            </Badge>
                                        </div>
                                        {document && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setPreview(document)
                                                    }
                                                >
                                                    Pratinjau
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={showDocument.url(
                                                            document.id,
                                                            {
                                                                query: {
                                                                    download: 1,
                                                                },
                                                            },
                                                        )}
                                                    >
                                                        Unduh
                                                    </a>
                                                </Button>
                                                {!document.is_verified && (
                                                    <Button
                                                        type="button"
                                                        disabled={pending}
                                                        onClick={() =>
                                                            router.patch(
                                                                verify.url(
                                                                    document.id,
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                    onStart:
                                                                        () =>
                                                                            setPending(
                                                                                true,
                                                                            ),
                                                                    onFinish:
                                                                        () =>
                                                                            setPending(
                                                                                false,
                                                                            ),
                                                                    onError:
                                                                        () =>
                                                                            toast.error(
                                                                                'Verifikasi gagal.',
                                                                            ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Verifikasi berkas
                                                    </Button>
                                                )}
                                                {applicant.status !==
                                                    'accepted' && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeletion({
                                                                kind: 'document',
                                                                id: document.id,
                                                                label: documentLabels[
                                                                    type
                                                                ],
                                                            })
                                                        }
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {applicant.status !== 'accepted' && (
                                <DocumentUpload applicant={applicant} />
                            )}
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Jadwal dan kehadiran sowan</FrameTitle>
                        </FrameHeader>
                        <FramePanel>
                            <form
                                className="grid gap-4 md:grid-cols-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    visitForm.submit(visit(applicant.id), {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                {(
                                    [
                                        ['visit_scheduled_at', 'Jadwal sowan'],
                                        ['visited_at', 'Hadir di pondok'],
                                        ['sowan_done_at', 'Sowan selesai'],
                                    ] as const
                                ).map(([key, label]) => (
                                    <Field key={key}>
                                        <FieldLabel htmlFor={key}>
                                            {label} (WIB)
                                        </FieldLabel>
                                        <Input
                                            id={key}
                                            type="datetime-local"
                                            value={visitForm.data[key]}
                                            onChange={(event) =>
                                                visitForm.setData(
                                                    key,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={visitForm.errors[key]}
                                        />
                                    </Field>
                                ))}
                                <Field className="md:col-span-2">
                                    <FieldLabel htmlFor="admin_note">
                                        Catatan admin
                                    </FieldLabel>
                                    <Textarea
                                        id="admin_note"
                                        value={visitForm.data.admin_note}
                                        onChange={(event) =>
                                            visitForm.setData(
                                                'admin_note',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={visitForm.errors.admin_note}
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    disabled={visitForm.processing}
                                >
                                    Simpan catatan sowan
                                </Button>
                            </form>
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Administrasi di kantor</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            <p className="font-medium tabular-nums">
                                Total tercatat:{' '}
                                {rupiah(
                                    applicant.payments.reduce(
                                        (sum, payment) => sum + payment.amount,
                                        0,
                                    ),
                                )}
                            </p>
                            {applicant.payments.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada pembayaran. Catat pembayaran
                                    kantor melalui formulir di bawah.
                                </p>
                            )}
                            {applicant.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between gap-3 border-b border-border py-3"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="tabular-nums">
                                            {rupiah(payment.amount)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {dateTime(payment.paid_at)} —{' '}
                                            {payment.note}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() =>
                                            setDeletion({
                                                kind: 'payment',
                                                id: payment.id,
                                                label: 'catatan pembayaran',
                                            })
                                        }
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            ))}
                            <form
                                className="grid gap-4 sm:grid-cols-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    paymentForm.submit(
                                        storePayment(applicant.id),
                                        {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                paymentForm.reset(),
                                        },
                                    );
                                }}
                            >
                                <Field>
                                    <FieldLabel htmlFor="amount">
                                        Jumlah (rupiah)
                                    </FieldLabel>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        max={999999999999}
                                        required
                                        value={paymentForm.data.amount}
                                        onChange={(event) =>
                                            paymentForm.setData(
                                                'amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={paymentForm.errors.amount}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="paid_at">
                                        Waktu bayar (WIB)
                                    </FieldLabel>
                                    <Input
                                        id="paid_at"
                                        type="datetime-local"
                                        required
                                        value={paymentForm.data.paid_at}
                                        onChange={(event) =>
                                            paymentForm.setData(
                                                'paid_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={paymentForm.errors.paid_at}
                                    />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <FieldLabel htmlFor="payment_note">
                                        Catatan pembayaran
                                    </FieldLabel>
                                    <Textarea
                                        id="payment_note"
                                        value={paymentForm.data.note}
                                        onChange={(event) =>
                                            paymentForm.setData(
                                                'note',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={paymentForm.errors.note}
                                    />
                                </Field>
                                <Button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                >
                                    Catat pembayaran
                                </Button>
                            </form>
                        </FramePanel>
                    </Frame>
                </div>
                <div className="flex flex-col gap-4">
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Keputusan</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-3">
                            {transitions.map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={
                                        value === 'rejected' ||
                                        value === 'cancelled'
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                    onClick={() => choose(value)}
                                >
                                    {value === 'registered'
                                        ? 'Aktifkan kembali'
                                        : value === 'verified'
                                          ? 'Verifikasi pendaftar'
                                          : value === 'accepted'
                                            ? 'Terima'
                                            : value === 'rejected'
                                              ? 'Tolak'
                                              : 'Batalkan'}
                                </Button>
                            ))}
                            <p className="text-xs text-muted-foreground">
                                Penerimaan memerlukan semua berkas wajib
                                terverifikasi. Pembayaran dicatat terpisah.
                            </p>
                        </FramePanel>
                    </Frame>
                    <Frame spacing="default">
                        <FrameHeader>
                            <FrameTitle>Riwayat status</FrameTitle>
                        </FrameHeader>
                        <FramePanel className="flex flex-col gap-4">
                            {applicant.status_histories.length === 0 && (
                                <p>
                                    Belum ada riwayat. Pilih aksi keputusan
                                    untuk mencatat perubahan.
                                </p>
                            )}
                            {applicant.status_histories.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-1 border-b border-border pb-3"
                                >
                                    <span className="font-medium">
                                        {item.from_status
                                            ? `${statusLabels[item.from_status]} → `
                                            : ''}
                                        {statusLabels[item.to_status]}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {dateTime(item.created_at)} ·{' '}
                                        {item.actor?.name ??
                                            'Pendaftaran publik'}
                                    </span>
                                    {item.reason && (
                                        <p className="text-sm">{item.reason}</p>
                                    )}
                                </div>
                            ))}
                        </FramePanel>
                    </Frame>
                </div>
            </div>
            <Dialog
                open={preview !== null}
                onOpenChange={(value) => {
                    if (!value) setPreview(null);
                }}
            >
                <DialogContent className="flex h-[85dvh] min-h-0 max-w-3xl flex-col">
                    <DialogHeader>
                        <DialogTitle>Pratinjau berkas</DialogTitle>
                        <DialogDescription>
                            {preview?.original_name}
                        </DialogDescription>
                    </DialogHeader>
                    {preview &&
                        (preview.type === 'pas_foto' ? (
                            <img
                                src={showDocument.url(preview.id)}
                                alt="Pas foto calon santri"
                                className="min-h-0 w-full flex-1 object-contain"
                            />
                        ) : (
                            <iframe
                                title="Pratinjau dokumen PDF"
                                src={showDocument.url(preview.id)}
                                className="min-h-0 w-full flex-1"
                            />
                        ))}
                </DialogContent>
            </Dialog>
            <AlertDialog
                open={decision !== null}
                onOpenChange={(value) => {
                    if (!value && !decisionForm.processing) setDecision(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {decision ? statusLabels[decision] : 'Ubah status'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Perubahan keputusan akan dicatat dalam riwayat.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            decisionForm.submit(status(applicant.id), {
                                preserveScroll: true,
                                onSuccess: () => setDecision(null),
                            });
                        }}
                    >
                        {decision === 'rejected' && (
                            <Field>
                                <FieldLabel htmlFor="decision_reason">
                                    Alasan penolakan
                                </FieldLabel>
                                <Textarea
                                    id="decision_reason"
                                    required
                                    value={decisionForm.data.decision_reason}
                                    onChange={(event) =>
                                        decisionForm.setData(
                                            'decision_reason',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={
                                        decisionForm.errors.decision_reason
                                    }
                                />
                            </Field>
                        )}
                        <InputError message={decisionForm.errors.status} />
                        <InputError message={pageErrors.program_id} />
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={decisionForm.processing}
                            >
                                Kembali
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                variant={
                                    decision === 'rejected' ||
                                    decision === 'cancelled'
                                        ? 'destructive'
                                        : 'default'
                                }
                                disabled={decisionForm.processing}
                            >
                                Konfirmasi
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
            <ConfirmDeleteDialog
                open={deletion !== null}
                onOpenChange={(value) => {
                    if (!value) setDeletion(null);
                }}
                title={deletion?.label ?? 'data'}
                processing={pending}
                onConfirm={() => {
                    if (!deletion) return;
                    const target =
                        deletion.kind === 'document'
                            ? deleteDocument({
                                  applicant: applicant.id,
                                  document: deletion.id,
                              })
                            : deletePayment({
                                  applicant: applicant.id,
                                  payment: deletion.id,
                              });
                    router.delete(target.url, {
                        preserveScroll: true,
                        onStart: () => setPending(true),
                        onFinish: () => setPending(false),
                        onSuccess: () => setDeletion(null),
                        onError: (errors) =>
                            toast.error(
                                Object.values(errors)[0] ??
                                    'Data gagal dihapus.',
                            ),
                    });
                }}
            />
        </PsbAdminPage>
    );
}
