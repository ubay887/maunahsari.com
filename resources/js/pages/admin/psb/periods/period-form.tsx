import { Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FrameDescription,
    FramePanel,
} from '@/components/reui/frame';
import { RichTextEditor } from '@/components/rich-text-editor';
import { FormActions } from '@/components/admin/form-actions';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { localDateTime, toRichText } from '@/lib/psb';
import { index, store, update } from '@/routes/admin/psb/periods';
import { store as uploadImage } from '@/routes/admin/psb/periods/images';
import type { Period } from '@/types/psb';

export function PeriodForm({ period }: { period?: Period }) {
    const form = useForm({
        name: period?.name ?? '',
        academic_year: period?.academic_year ?? '',
        is_open: period?.is_open ?? false,
        opens_at: localDateTime(period?.opens_at ?? null),
        closes_at: localDateTime(period?.closes_at ?? null),
        fee_url_putra: period?.fee_url_putra ?? '',
        fee_url_putri: period?.fee_url_putri ?? '',
        contact_whatsapp_putra: period?.contact_whatsapp_putra ?? '',
        contact_whatsapp_putri: period?.contact_whatsapp_putri ?? '',
        info_note: toRichText(period?.info_note ?? null),
    });
    return (
        <form
            className="flex min-w-0 flex-col gap-4"
            aria-busy={form.processing}
            onSubmit={(event) => {
                event.preventDefault();
                form.transform((data) => ({
                    ...data,
                    opens_at: new Date(data.opens_at + '+07:00').toISOString(),
                    closes_at: data.closes_at
                        ? new Date(data.closes_at + '+07:00').toISOString()
                        : null,
                }));
                form.submit(period ? update(period.id) : store(), {
                    onSuccess: () => form.setDefaults(),
                    onError: () =>
                        toast.error(
                            'Periode belum tersimpan. Periksa isian formulir.',
                        ),
                });
            }}
        >
            <UnsavedChangesDialog
                isDirty={form.isDirty}
                processing={form.processing}
            />
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Identitas periode</FrameTitle>
                    <FrameDescription>
                        Nama dan tahun ajaran pendaftaran.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="grid gap-4 md:grid-cols-2">
                    {(
                        [
                            ['name', 'Nama periode'],
                            ['academic_year', 'Tahun ajaran'],
                        ] as const
                    ).map(([key, label]) => (
                        <Field key={key}>
                            <FieldLabel htmlFor={key}>{label}</FieldLabel>
                            <Input
                                id={key}
                                value={form.data[key]}
                                onChange={(event) =>
                                    form.setData(key, event.target.value)
                                }
                                placeholder={
                                    key === 'academic_year'
                                        ? '2026/2027'
                                        : 'Contoh: PSB 2026/2027 Gelombang 1'
                                }
                                required
                                maxLength={key === 'academic_year' ? 9 : 255}
                                disabled={form.processing}
                                aria-invalid={Boolean(form.errors[key])}
                            />
                            <InputError message={form.errors[key]} />
                        </Field>
                    ))}
                </FramePanel>
            </Frame>
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Jadwal pendaftaran</FrameTitle>
                    <FrameDescription>
                        Seluruh jadwal menggunakan Waktu Indonesia Barat.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="grid gap-4 md:grid-cols-2">
                    {(
                        [
                            ['opens_at', 'Mulai pendaftaran (WIB)'],
                            [
                                'closes_at',
                                'Selesai pendaftaran (opsional, WIB)',
                            ],
                        ] as const
                    ).map(([key, label]) => (
                        <Field key={key}>
                            <FieldLabel htmlFor={key}>{label}</FieldLabel>
                            <Input
                                id={key}
                                type="datetime-local"
                                value={form.data[key]}
                                onChange={(event) =>
                                    form.setData(key, event.target.value)
                                }
                                required={key === 'opens_at'}
                                disabled={form.processing}
                                aria-invalid={Boolean(form.errors[key])}
                            />
                            <InputError message={form.errors[key]} />
                        </Field>
                    ))}
                    <Field className="md:col-span-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_open"
                                checked={form.data.is_open}
                                disabled={form.processing}
                                onCheckedChange={(value) =>
                                    form.setData('is_open', value === true)
                                }
                            />
                            <FieldLabel htmlFor="is_open">
                                Aktifkan pendaftaran sesuai jadwal
                            </FieldLabel>
                        </div>
                        <FieldDescription>
                            Pendaftaran dibuka hanya saat periode aktif dan
                            berada dalam rentang jadwal.
                        </FieldDescription>
                        <InputError message={form.errors.is_open} />
                    </Field>
                </FramePanel>
            </Frame>
            <Frame spacing="default">
                <FrameHeader>
                    <FrameTitle>Kontak dan biaya</FrameTitle>
                    <FrameDescription>
                        Informasi narahubung dan rincian biaya per pondok.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="grid items-start gap-4 md:grid-cols-2">
                    {(['putra', 'putri'] as const).map((pondok) => (
                        <div
                            key={pondok}
                            className="flex min-w-0 flex-col gap-4"
                        >
                            <h3 className="text-sm font-semibold tracking-tight capitalize">
                                Pondok {pondok}
                            </h3>
                            <Field>
                                <FieldLabel
                                    htmlFor={`contact_whatsapp_${pondok}`}
                                >
                                    WhatsApp (opsional)
                                </FieldLabel>
                                <Input
                                    id={`contact_whatsapp_${pondok}`}
                                    type="tel"
                                    placeholder="08… atau 628…"
                                    value={
                                        form.data[`contact_whatsapp_${pondok}`]
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            `contact_whatsapp_${pondok}`,
                                            event.target.value,
                                        )
                                    }
                                    disabled={form.processing}
                                    aria-invalid={Boolean(
                                        form.errors[
                                            `contact_whatsapp_${pondok}`
                                        ],
                                    )}
                                />
                                <InputError
                                    message={
                                        form.errors[
                                            `contact_whatsapp_${pondok}`
                                        ]
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor={`fee_url_${pondok}`}>
                                    Tautan rincian biaya (opsional)
                                </FieldLabel>
                                <Input
                                    id={`fee_url_${pondok}`}
                                    type="url"
                                    placeholder="https://drive.google.com/…"
                                    value={form.data[`fee_url_${pondok}`]}
                                    onChange={(event) =>
                                        form.setData(
                                            `fee_url_${pondok}`,
                                            event.target.value,
                                        )
                                    }
                                    disabled={form.processing}
                                    aria-invalid={Boolean(
                                        form.errors[`fee_url_${pondok}`],
                                    )}
                                />
                                <FieldDescription>
                                    Gunakan tautan Google Drive yang dapat
                                    diakses publik.
                                </FieldDescription>
                                <InputError
                                    message={form.errors[`fee_url_${pondok}`]}
                                />
                            </Field>
                        </div>
                    ))}
                </FramePanel>
            </Frame>
            <section
                aria-labelledby="period-information"
                className="flex min-w-0 flex-col gap-3"
            >
                <div className="flex flex-col gap-0.5">
                    <h2
                        id="period-information"
                        className="text-sm font-semibold tracking-tight"
                    >
                        Informasi, syarat, dan fasilitas
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Gunakan judul, daftar poin, tabel, dan gambar untuk
                        menyusun informasi publik.
                    </p>
                </div>
                <RichTextEditor
                    label="Informasi pendaftaran"
                    value={form.data.info_note}
                    onChange={(html) => form.setData('info_note', html)}
                    uploadUrl={uploadImage.url()}
                    disabled={form.processing}
                />
                <p className="text-xs text-muted-foreground">
                    Gambar JPG, PNG, atau WebP; maksimal 2 MB per gambar.
                </p>
                <InputError message={form.errors.info_note} />
            </section>
            <FormActions dirty={form.isDirty}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={form.processing}
                    asChild
                >
                    <Link href={index()}>Batal</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Menyimpan…'
                        : period
                          ? 'Simpan perubahan'
                          : 'Simpan periode'}
                </Button>
            </FormActions>
        </form>
    );
}
