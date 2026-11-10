import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { localDateTime, slugify } from '@/lib/articles';
import { index, store, update } from '@/routes/admin/articles';
import { store as uploadImage } from '@/routes/admin/articles/images';
import type { ArticleFormProps, ArticleStatus } from '@/types/article';

type FormData = {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: File | null;
    remove_cover: boolean;
    category_ids: number[];
    tag_names: string[];
    status: ArticleStatus;
    published_at: string;
    meta_title: string;
    meta_description: string;
    _method: string;
};
const publicationDescriptions: Record<ArticleStatus, string> = {
    draft: 'Simpan sebagai draf untuk melanjutkan penyuntingan nanti.',
    published: 'Artikel terlihat di halaman publik setelah disimpan.',
    scheduled: 'Artikel terbit otomatis pada tanggal dan jam yang ditentukan.',
    archived: 'Artikel diarsipkan dan disembunyikan dari halaman publik.',
};
export default function ArticleForm({
    article,
    categories,
    tags,
    canPublish,
    statuses,
}: ArticleFormProps) {
    const [slugEdited, setSlugEdited] = useState(Boolean(article));
    const [tagInput, setTagInput] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<FormData>({
        title: article?.title ?? '',
        slug: article?.slug ?? '',
        content: article?.content ?? '',
        excerpt: article?.excerpt ?? '',
        cover_image: null,
        remove_cover: false,
        category_ids: article?.categories.map((item) => item.id) ?? [],
        tag_names: article?.tags.map((item) => item.name) ?? [],
        status: article?.status ?? 'draft',
        published_at: localDateTime(article?.published_at ?? null),
        meta_title: article?.meta_title ?? '',
        meta_description: article?.meta_description ?? '',
        _method: article ? 'put' : 'post',
    });
    useEffect(() => {
        const file = form.data.cover_image;
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.cover_image]);
    function addTag(name: string) {
        const clean = name.trim();
        if (
            clean &&
            !form.data.tag_names.some(
                (value) =>
                    value.toLocaleLowerCase() === clean.toLocaleLowerCase(),
            )
        )
            form.setData('tag_names', [...form.data.tag_names, clean]);
        setTagInput('');
    }
    const cover = form.data.cover_image
        ? preview
        : form.data.remove_cover
          ? null
          : article?.cover_url;
    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            slug: !article && !slugEdited ? '' : data.slug,
            published_at: data.published_at
                ? new Date(data.published_at).toISOString()
                : null,
        }));
        const options = {
            forceFormData: true,
            onSuccess: () => form.setDefaults(),
            onError: () =>
                toast.error('Artikel belum tersimpan. Periksa isian form.'),
        };
        form.post(article ? update.url(article.id) : store.url(), options);
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
                        <FrameTitle>Isi artikel</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <Field className="w-auto">
                            <FieldLabel htmlFor="article-title">
                                Judul
                            </FieldLabel>
                            <Input
                                id="article-title"
                                required
                                maxLength={255}
                                value={form.data.title}
                                onChange={(event) => {
                                    const title = event.target.value;
                                    form.setData((data) => ({
                                        ...data,
                                        title,
                                        slug: slugEdited
                                            ? data.slug
                                            : slugify(title),
                                    }));
                                }}
                                aria-invalid={Boolean(form.errors.title)}
                            />
                            <InputError message={form.errors.title} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="article-slug">Slug</FieldLabel>
                            <Input
                                id="article-slug"
                                value={form.data.slug}
                                onChange={(event) => {
                                    setSlugEdited(true);
                                    form.setData('slug', event.target.value);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Dibuat dari judul; tetap stabil setelah artikel
                                disimpan.
                            </p>
                            <InputError message={form.errors.slug} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel>Konten</FieldLabel>
                            <RichTextEditor
                                value={form.data.content}
                                onChange={(html) =>
                                    form.setData('content', html)
                                }
                                uploadUrl={uploadImage.url()}
                                disabled={form.processing}
                            />
                            <InputError message={form.errors.content} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="article-excerpt">
                                Ringkasan
                            </FieldLabel>
                            <Textarea
                                id="article-excerpt"
                                value={form.data.excerpt}
                                onChange={(event) =>
                                    form.setData('excerpt', event.target.value)
                                }
                            />
                            <InputError message={form.errors.excerpt} />
                        </Field>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="article-cover">
                                Gambar sampul
                            </FieldLabel>
                            <Input
                                id="article-cover"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => {
                                    form.setData(
                                        'cover_image',
                                        event.target.files?.[0] ?? null,
                                    );
                                    form.setData('remove_cover', false);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, atau WebP. Maksimal 2 MB.
                            </p>
                            {cover && (
                                <div className="flex flex-col items-start gap-2">
                                    <img
                                        src={cover}
                                        alt="Pratinjau sampul"
                                        className="aspect-video w-full max-w-sm object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            form.setData('cover_image', null);
                                            form.setData('remove_cover', true);
                                        }}
                                    >
                                        Hapus sampul
                                    </Button>
                                </div>
                            )}
                            <InputError message={form.errors.cover_image} />
                        </Field>
                    </FramePanel>
                </Frame>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Kategori dan tag</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="flex flex-col gap-4">
                        <fieldset className="flex flex-col gap-3">
                            <legend className="text-sm font-medium">
                                Kategori
                            </legend>
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
                                <p className="text-sm text-muted-foreground">
                                    Belum ada kategori. Artikel tetap dapat
                                    disimpan.
                                </p>
                            )}
                            <InputError message={form.errors.category_ids} />
                        </fieldset>
                        <Field className="w-auto">
                            <FieldLabel htmlFor="article-tag">Tag</FieldLabel>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="article-tag"
                                    list="article-tags"
                                    value={tagInput}
                                    maxLength={80}
                                    onChange={(event) =>
                                        setTagInput(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            addTag(tagInput);
                                        }
                                    }}
                                    placeholder="Pilih atau buat tag baru"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addTag(tagInput)}
                                >
                                    Tambah
                                </Button>
                            </div>
                            <datalist id="article-tags">
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.name} />
                                ))}
                            </datalist>
                            <div className="flex flex-wrap gap-2">
                                {form.data.tag_names.map((name) => (
                                    <Button
                                        type="button"
                                        key={name}
                                        variant="secondary"
                                        aria-label={'Hapus tag ' + name}
                                        onClick={() =>
                                            form.setData(
                                                'tag_names',
                                                form.data.tag_names.filter(
                                                    (tag) => tag !== name,
                                                ),
                                            )
                                        }
                                    >
                                        {name} ×
                                    </Button>
                                ))}
                            </div>
                            <InputError message={form.errors.tag_names} />
                        </Field>
                    </FramePanel>
                </Frame>
                <Frame spacing="default">
                    <FrameHeader>
                        <FrameTitle>Publikasi</FrameTitle>
                    </FrameHeader>
                    <FramePanel className="grid gap-4 md:grid-cols-2">
                        <Field className="w-auto min-w-0">
                            <FieldLabel htmlFor="article-status">
                                Status publikasi
                            </FieldLabel>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData(
                                        'status',
                                        value as ArticleStatus,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="article-status"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                            disabled={
                                                !canPublish &&
                                                [
                                                    'published',
                                                    'scheduled',
                                                ].includes(status.value)
                                            }
                                        >
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {publicationDescriptions[form.data.status]}
                            </p>
                            <InputError message={form.errors.status} />
                        </Field>
                        <Field className="w-auto min-w-0">
                            <FieldLabel htmlFor="article-schedule">
                                Tanggal terbit
                            </FieldLabel>
                            <Input
                                id="article-schedule"
                                type="datetime-local"
                                className="scheme-light dark:scheme-dark"
                                disabled={
                                    !['scheduled', 'published'].includes(
                                        form.data.status,
                                    )
                                }
                                value={form.data.published_at}
                                required={form.data.status === 'scheduled'}
                                onChange={(event) =>
                                    form.setData(
                                        'published_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {['scheduled', 'published'].includes(
                                    form.data.status,
                                )
                                    ? 'Tanggal dan jam mengikuti zona waktu perangkat Anda.'
                                    : 'Pilih status Terjadwal atau Terbit untuk mengatur tanggal.'}
                            </p>
                            <InputError message={form.errors.published_at} />
                        </Field>
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
                                onChange={(event) =>
                                    form.setData(
                                        'meta_title',
                                        event.target.value,
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
                                onChange={(event) =>
                                    form.setData(
                                        'meta_description',
                                        event.target.value,
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
                    {form.processing ? 'Menyimpan…' : 'Simpan artikel'}
                </Button>
            </FormActions>
        </form>
    );
}
