import { Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FormActions } from '@/components/admin/form-actions';
import InputError from '@/components/input-error';
import {
    Frame,
    FrameHeader,
    FrameTitle,
    FramePanel,
} from '@/components/reui/frame';
import { RichTextEditor } from '@/components/rich-text-editor';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { slugify } from '@/lib/articles';
import { store as uploadImage } from '@/routes/admin/articles/images';
import { index, store, update } from '@/routes/admin/events';
import { index as taxonomies } from '@/routes/admin/taxonomies';
import type { EventFormProps, EventStatus, EventType } from '@/types/event';

type FormData = {
    title: string;
    slug: string;
    summary: string;
    description: string;
    start_at: string;
    end_at: string;
    timezone: string;
    type: EventType;
    status: EventStatus;
    location_name: string;
    address: string;
    map_url: string;
    meeting_url: string;
    registration_url: string;
    contact_whatsapp: string;
    category_ids: number[];
    banner: File | null;
    remove_banner: boolean;
    meta_title: string;
    meta_description: string;
    _method: string;
};
export default function EventForm({
    event,
    categories,
    statuses,
    types,
    startLocal,
    endLocal,
}: EventFormProps) {
    const [slugEdited, setSlugEdited] = useState(Boolean(event));
    const [preview, setPreview] = useState<string | null>(null);
    const bannerInput = useRef<HTMLInputElement>(null);
    const form = useForm<FormData>({
        title: event?.title ?? '',
        slug: event?.slug ?? '',
        summary: event?.summary ?? '',
        description: event?.description ?? '',
        start_at: startLocal ?? '',
        end_at: endLocal ?? '',
        timezone: 'Asia/Jakarta',
        type: event?.type ?? 'offline',
        status: event?.status ?? 'draft',
        location_name: event?.location_name ?? '',
        address: event?.address ?? '',
        map_url: event?.map_url ?? '',
        meeting_url: event?.meeting_url ?? '',
        registration_url: event?.registration_url ?? '',
        contact_whatsapp: event?.contact_whatsapp ?? '',
        category_ids: event?.categories.map((item) => item.id) ?? [],
        banner: null,
        remove_banner: false,
        meta_title: event?.meta_title ?? '',
        meta_description: event?.meta_description ?? '',
        _method: event ? 'put' : 'post',
    });
    useEffect(() => {
        if (!form.data.banner) return;
        const url = URL.createObjectURL(form.data.banner);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.banner]);
    const banner = form.data.banner
        ? preview
        : form.data.remove_banner
          ? null
          : event?.banner_url;
    function submit(submitEvent: FormEvent<HTMLFormElement>) {
        submitEvent.preventDefault();
        form.transform((data) => ({
            ...data,
            slug: !event && !slugEdited ? '' : data.slug,
        }));
        form.post(event ? update.url(event.id) : store.url(), {
            forceFormData: true,
            onSuccess: () => form.setDefaults(),
            onError: () =>
                toast.error('Event belum tersimpan. Periksa isian form.'),
        });
    }
    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <UnsavedChangesDialog
                isDirty={form.isDirty}
                processing={form.processing}
            />
            {form.hasErrors && (
                <p role="alert" className="text-sm text-destructive">
                    Periksa isian yang ditandai di bawah.
                </p>
            )}
            <fieldset
                disabled={form.processing}
                className="flex min-w-0 flex-col gap-4"
            >
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Informasi dasar</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="event-title">Judul</FieldLabel>
                            <Input
                                id="event-title"
                                required
                                maxLength={255}
                                value={form.data.title}
                                aria-invalid={Boolean(form.errors.title)}
                                onChange={(change) => {
                                    const title = change.target.value;
                                    form.setData((data) => ({
                                        ...data,
                                        title,
                                        slug: slugEdited
                                            ? data.slug
                                            : slugify(title),
                                    }));
                                }}
                            />
                            <InputError message={form.errors.title} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="event-slug">Slug</FieldLabel>
                            <Input
                                id="event-slug"
                                maxLength={255}
                                value={form.data.slug}
                                onChange={(change) => {
                                    setSlugEdited(true);
                                    form.setData('slug', change.target.value);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Dibuat otomatis dari judul dan tetap stabil
                                setelah disimpan.
                            </p>
                            <InputError message={form.errors.slug} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="event-summary">
                                Ringkasan
                            </FieldLabel>
                            <Textarea
                                id="event-summary"
                                maxLength={2000}
                                value={form.data.summary}
                                onChange={(change) =>
                                    form.setData('summary', change.target.value)
                                }
                            />
                            <InputError message={form.errors.summary} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel>Deskripsi</FieldLabel>
                            <RichTextEditor
                                value={form.data.description}
                                onChange={(html) =>
                                    form.setData('description', html)
                                }
                                uploadUrl={uploadImage.url()}
                                disabled={form.processing}
                            />
                            <InputError message={form.errors.description} />
                        </Field>
                    </FramePanel>
                </Frame>
                <Frame spacing="default">
                    <FrameHeader>
                        <FrameTitle>Jadwal dan publikasi</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <div className="flex min-w-0 flex-col gap-3">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {(
                                    [
                                        ['start_at', 'Mulai'],
                                        ['end_at', 'Selesai'],
                                    ] as const
                                ).map(([field, label]) => (
                                    <div
                                        key={field}
                                        className="flex min-w-0 flex-col gap-2"
                                    >
                                        <FieldLabel htmlFor={field}>
                                            {label}
                                        </FieldLabel>
                                        <Input
                                            id={field}
                                            type="datetime-local"
                                            className="scheme-light dark:scheme-dark"
                                            required
                                            value={form.data[field]}
                                            min={
                                                field === 'end_at'
                                                    ? form.data.start_at
                                                    : undefined
                                            }
                                            onChange={(change) =>
                                                form.setData(
                                                    field,
                                                    change.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors[field]}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Jadwal menggunakan Waktu Indonesia Barat (WIB).
                            </p>
                            <InputError message={form.errors.timezone} />
                        </div>
                        <Field className="w-auto min-w-0">
                            <FieldLabel htmlFor="event-status">
                                Status publikasi
                            </FieldLabel>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData('status', value as EventStatus)
                                }
                            >
                                <SelectTrigger
                                    id="event-status"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Draf hanya terlihat oleh admin. Event terbit dan
                                dibatalkan tetap terlihat di halaman publik.
                            </p>
                            <InputError message={form.errors.status} />
                        </Field>
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Tipe dan lokasi</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="event-type">
                                Tipe event
                            </FieldLabel>
                            <Select
                                value={form.data.type}
                                onValueChange={(value) =>
                                    form.setData('type', value as EventType)
                                }
                            >
                                <SelectTrigger id="event-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.type} />
                        </Field>
                        {form.data.type !== 'online' && (
                            <>
                                <Field className="w-auto">
                                    <FieldLabel htmlFor="location-name">
                                        Nama lokasi
                                    </FieldLabel>
                                    <Input
                                        id="location-name"
                                        required
                                        maxLength={255}
                                        value={form.data.location_name}
                                        onChange={(change) =>
                                            form.setData(
                                                'location_name',
                                                change.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.location_name}
                                    />
                                </Field>
                                <Field className="w-auto">
                                    <FieldLabel htmlFor="event-address">
                                        Alamat
                                    </FieldLabel>
                                    <Textarea
                                        id="event-address"
                                        required
                                        maxLength={5000}
                                        value={form.data.address}
                                        onChange={(change) =>
                                            form.setData(
                                                'address',
                                                change.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.address} />
                                </Field>
                                <Field className="w-auto">
                                    <FieldLabel htmlFor="map-url">
                                        Tautan peta (opsional)
                                    </FieldLabel>
                                    <Input
                                        id="map-url"
                                        type="url"
                                        value={form.data.map_url}
                                        onChange={(change) =>
                                            form.setData(
                                                'map_url',
                                                change.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.map_url} />
                                </Field>
                            </>
                        )}
                        {form.data.type !== 'offline' && (
                            <Field className="w-auto">
                                <FieldLabel htmlFor="meeting-url">
                                    Tautan meeting
                                </FieldLabel>
                                <Input
                                    id="meeting-url"
                                    type="url"
                                    required
                                    value={form.data.meeting_url}
                                    onChange={(change) =>
                                        form.setData(
                                            'meeting_url',
                                            change.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tautan ini terlihat oleh seluruh pengunjung.
                                </p>
                                <InputError message={form.errors.meeting_url} />
                            </Field>
                        )}
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Pendaftaran dan kontak</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="registration-url">
                                Tautan pendaftaran eksternal (opsional)
                            </FieldLabel>
                            <Input
                                id="registration-url"
                                type="url"
                                value={form.data.registration_url}
                                onChange={(change) =>
                                    form.setData(
                                        'registration_url',
                                        change.target.value,
                                    )
                                }
                                placeholder="https://forms.gle/…"
                            />
                            <InputError
                                message={form.errors.registration_url}
                            />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="contact-whatsapp">
                                WhatsApp panitia (opsional)
                            </FieldLabel>
                            <Input
                                id="contact-whatsapp"
                                type="tel"
                                value={form.data.contact_whatsapp}
                                onChange={(change) =>
                                    form.setData(
                                        'contact_whatsapp',
                                        change.target.value,
                                    )
                                }
                                placeholder="081234567890"
                            />
                            <p className="text-xs text-muted-foreground">
                                Nomor Indonesia otomatis disimpan dengan awalan
                                62.
                            </p>
                            <InputError
                                message={form.errors.contact_whatsapp}
                            />
                        </Field>
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Kategori</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-3">
                        {categories.length ? (
                            categories.map((category) => (
                                <FieldLabel
                                    key={category.id}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        checked={form.data.category_ids.includes(
                                            category.id,
                                        )}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'category_ids',
                                                checked === true
                                                    ? [
                                                          ...form.data
                                                              .category_ids,
                                                          category.id,
                                                      ]
                                                    : form.data.category_ids.filter(
                                                          (id) =>
                                                              id !==
                                                              category.id,
                                                      ),
                                            )
                                        }
                                    />
                                    {category.parent_id ? '↳ ' : ''}
                                    {category.name}
                                </FieldLabel>
                            ))
                        ) : (
                            <div className="flex flex-col items-start gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Belum ada kategori. Event tetap dapat
                                    disimpan.
                                </p>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={taxonomies()}>
                                        Kelola kategori
                                    </Link>
                                </Button>
                            </div>
                        )}
                        <InputError message={form.errors.category_ids} />
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Banner</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="event-banner">
                                Gambar banner
                            </FieldLabel>
                            <Input
                                ref={bannerInput}
                                id="event-banner"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(change) => {
                                    form.setData(
                                        'banner',
                                        change.target.files?.[0] ?? null,
                                    );
                                    form.setData('remove_banner', false);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, atau WebP. Maksimal 2 MB.
                            </p>
                            <InputError message={form.errors.banner} />
                        </Field>
                        {banner && (
                            <div className="flex flex-col items-start gap-2">
                                <img
                                    src={banner}
                                    alt="Pratinjau banner"
                                    className="aspect-video w-full max-w-sm object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        form.setData('banner', null);
                                        form.setData('remove_banner', true);
                                        if (bannerInput.current)
                                            bannerInput.current.value = '';
                                    }}
                                >
                                    Hapus banner
                                </Button>
                            </div>
                        )}
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>SEO</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="meta-title">
                                Meta title
                            </FieldLabel>
                            <Input
                                id="meta-title"
                                maxLength={70}
                                value={form.data.meta_title}
                                onChange={(change) =>
                                    form.setData(
                                        'meta_title',
                                        change.target.value,
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {form.data.meta_title.length}/70 karakter
                            </p>
                            <InputError message={form.errors.meta_title} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="meta-description">
                                Meta description
                            </FieldLabel>
                            <Textarea
                                id="meta-description"
                                maxLength={160}
                                value={form.data.meta_description}
                                onChange={(change) =>
                                    form.setData(
                                        'meta_description',
                                        change.target.value,
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {form.data.meta_description.length}/160 karakter
                            </p>
                            <InputError
                                message={form.errors.meta_description}
                            />
                        </Field>
                    </FramePanel>
                </Frame>
            </fieldset>
            {Object.entries(form.errors)
                .filter(([key]) => key.includes('.'))
                .map(([key, message]) => (
                    <InputError key={key} message={message} />
                ))}
            {form.progress && (
                <p role="status" className="text-xs text-muted-foreground">
                    Mengunggah {form.progress.percentage}%
                </p>
            )}
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
                    {form.processing ? 'Menyimpan…' : 'Simpan event'}
                </Button>
            </FormActions>
        </form>
    );
}
