import { useForm } from '@inertiajs/react';
import { FileText, Image } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PortalPage } from '@/components/alumni/portal-page';
import { Meter } from '@/components/portal/kit';
import { DocumentStatusBadge } from '@/components/psb/document-status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import {
    Frame,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { validateDocument } from '@/lib/psb';
import { show, store } from '@/routes/psb/portal/documents';
import type {
    DocumentType,
    PortalApplicant,
    PortalDocument,
} from '@/types/psb';

function DocumentRow({
    document,
    canEdit,
}: {
    document: PortalDocument;
    canEdit: boolean;
}) {
    const [inputKey, setInputKey] = useState(0);
    const form = useForm<{ type: DocumentType; document: File | null }>({
        type: document.type,
        document: null,
    });
    const inputId = `document-${document.type}`;

    function choose(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        const error = file ? validateDocument(file, document.type) : null;
        if (error) {
            form.setError('document', error);
            event.target.value = '';
            form.setData('document', null);

            return;
        }
        form.clearErrors('document');
        form.setData('document', file);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(store().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('document');
                setInputKey((key) => key + 1);
            },
            onError: () => toast.error('Berkas belum tersimpan.'),
        });
    }

    return (
        <FramePanel className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {document.type === 'pas_foto' ? (
                    <Image
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                ) : (
                    <FileText
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                )}
                <span className="min-w-0 flex-1 text-sm font-medium">
                    {document.label}
                </span>
                <DocumentStatusBadge document={document} />
            </div>
            {document.id !== null && (
                <p className="text-sm break-all">
                    {document.original_name}{' '}
                    <a
                        href={show.url(document.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        Buka berkas
                    </a>
                </p>
            )}
            {canEdit && (
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-3"
                    aria-busy={form.processing}
                >
                    <Field className="min-w-0">
                        <FieldLabel htmlFor={inputId}>
                            {document.id === null
                                ? 'Unggah berkas'
                                : 'Ganti berkas'}
                        </FieldLabel>
                        <Input
                            key={inputKey}
                            id={inputId}
                            type="file"
                            accept={
                                document.type === 'pas_foto'
                                    ? 'image/jpeg,image/png,image/webp'
                                    : 'application/pdf'
                            }
                            onChange={choose}
                            aria-invalid={Boolean(form.errors.document)}
                        />
                        <FieldDescription>
                            {document.type === 'pas_foto'
                                ? 'Foto 3x4, JPG / PNG / WebP. Maksimal 2 MB.'
                                : 'PDF. Maksimal 2 MB.'}
                        </FieldDescription>
                        <InputError message={form.errors.document} />
                    </Field>
                    {form.progress && (
                        <p role="status" className="text-sm">
                            Mengunggah {form.progress.percentage}%
                        </p>
                    )}
                    <div>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={form.processing || !form.data.document}
                        >
                            {form.processing ? 'Menyimpan…' : 'Simpan berkas'}
                        </Button>
                    </div>
                </form>
            )}
        </FramePanel>
    );
}

export default function PortalDocuments({
    applicant,
    documents,
}: {
    applicant: PortalApplicant;
    documents: PortalDocument[];
}) {
    const uploaded = documents.filter((item) => item.id !== null).length;

    return (
        <PortalPage
            title="Berkas"
            description="Unggah atau ganti berkas persyaratan."
        >
            {!applicant.can_edit && (
                <Alert variant="info">
                    <AlertTitle>Berkas terkunci</AlertTitle>
                    <AlertDescription>
                        Pendaftaran sudah diproses pengurus sehingga berkas
                        tidak dapat diubah dari portal. Hubungi narahubung bila
                        ada yang perlu diperbaiki.
                    </AlertDescription>
                </Alert>
            )}
            <Frame spacing="default">
                <FramePanel>
                    <Meter
                        label="Berkas terunggah"
                        valueText={`${uploaded} dari ${documents.length}`}
                        value={(uploaded / Math.max(documents.length, 1)) * 100}
                    />
                </FramePanel>
            </Frame>
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Berkas persyaratan</FrameTitle>
                </FrameHeader>
                {documents.map((document) => (
                    <DocumentRow
                        key={document.type}
                        document={document}
                        canEdit={applicant.can_edit}
                    />
                ))}
            </Frame>
        </PortalPage>
    );
}
