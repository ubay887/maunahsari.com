import { useHttp } from '@inertiajs/react';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    ImagePlus,
    Link2,
    Table2,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Frame, FrameHeader, FramePanel } from '@/components/reui/frame';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { articleContentClasses } from '@/lib/article-content-styles';

export function RichTextEditor({
    value,
    onChange,
    uploadUrl,
    disabled = false,
    label = 'Isi artikel',
}: {
    value: string;
    onChange: (html: string) => void;
    uploadUrl: string;
    disabled?: boolean;
    label?: string;
}) {
    const inputId = useId();
    const [linkOpen, setLinkOpen] = useState(false);
    const [link, setLink] = useState('');
    const upload = useHttp<{ image: File | null }, { url: string }>({
        image: null,
    });
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: { openOnClick: false },
                underline: false,
                strike: false,
                horizontalRule: false,
            }),
            Image,
            TableKit,
        ],
        content: value,
        immediatelyRender: false,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: articleContentClasses + ' min-h-64 p-4 outline-none',
                role: 'textbox',
                'aria-label': label,
                'aria-multiline': 'true',
            },
        },
        onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    });
    const active = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            bold: current?.isActive('bold'),
            italic: current?.isActive('italic'),
            bullet: current?.isActive('bulletList'),
            ordered: current?.isActive('orderedList'),
            quote: current?.isActive('blockquote'),
        }),
    });
    useEffect(() => {
        if (editor && value !== editor.getHTML())
            editor.commands.setContent(value, { emitUpdate: false });
    }, [editor, value]);
    useEffect(() => {
        editor?.setEditable(!disabled, false);
    }, [editor, disabled]);
    if (!editor)
        return (
            <p role="status" className="text-sm text-muted-foreground">
                Memuat editor…
            </p>
        );
    async function uploadImage(file: File | undefined) {
        if (!file || !editor) return;
        upload.transform(() => ({ image: file }));
        try {
            const result = await upload.post(uploadUrl);
            editor
                .chain()
                .focus()
                .setImage({ src: result.url, alt: file.name })
                .run();
        } catch {
            toast.error(
                'Gambar gagal diunggah. Gunakan JPG, PNG, atau WebP maksimal 2 MB.',
            );
        }
    }
    const tools = [
        {
            label: 'Tebal',
            icon: Bold,
            selected: active?.bold,
            run: () => editor.chain().focus().toggleBold().run(),
        },
        {
            label: 'Miring',
            icon: Italic,
            selected: active?.italic,
            run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: 'Daftar poin',
            icon: List,
            selected: active?.bullet,
            run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: 'Daftar nomor',
            icon: ListOrdered,
            selected: active?.ordered,
            run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: 'Kutipan',
            icon: Quote,
            selected: active?.quote,
            run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            label: 'Tabel',
            icon: Table2,
            run: () =>
                editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run(),
        },
        {
            label: 'Undo',
            icon: Undo,
            run: () => editor.chain().focus().undo().run(),
        },
        {
            label: 'Redo',
            icon: Redo,
            run: () => editor.chain().focus().redo().run(),
        },
    ];
    return (
        <Frame spacing="sm">
            <FrameHeader>
                <div
                    className="flex flex-wrap items-center gap-1"
                    role="toolbar"
                    aria-label="Format konten"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={disabled}
                        onClick={() =>
                            editor.chain().focus().setParagraph().run()
                        }
                    >
                        Paragraf
                    </Button>
                    {([2, 3, 4] as const).map((level) => (
                        <Button
                            type="button"
                            key={level}
                            variant={
                                editor.isActive('heading', { level })
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            disabled={disabled}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level })
                                    .run()
                            }
                        >
                            H{level}
                        </Button>
                    ))}
                    {tools.map((tool) => (
                        <Button
                            type="button"
                            key={tool.label}
                            size="icon"
                            variant={tool.selected ? 'secondary' : 'ghost'}
                            aria-label={tool.label}
                            aria-pressed={tool.selected ?? false}
                            disabled={disabled}
                            onClick={tool.run}
                        >
                            <tool.icon aria-hidden />
                        </Button>
                    ))}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Tambahkan tautan"
                        disabled={disabled}
                        onClick={() => {
                            setLink(
                                String(editor.getAttributes('link').href ?? ''),
                            );
                            setLinkOpen(true);
                        }}
                    >
                        <Link2 aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Unggah gambar"
                        disabled={disabled || upload.processing}
                        onClick={() =>
                            document.getElementById(inputId)?.click()
                        }
                    >
                        <ImagePlus aria-hidden />
                    </Button>
                    <Input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            void uploadImage(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                    />
                </div>
            </FrameHeader>
            <FramePanel>
                <EditorContent editor={editor} />
            </FramePanel>
            {upload.processing && (
                <p role="status" className="text-xs text-muted-foreground">
                    Mengunggah gambar…
                </p>
            )}
            <InputError message={upload.errors.image} />
            <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tautan</DialogTitle>
                        <DialogDescription>
                            Gunakan alamat HTTPS. Kosongkan untuk menghapus
                            tautan.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldLabel htmlFor={inputId + '-link'}>URL</FieldLabel>
                    <Input
                        id={inputId + '-link'}
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        type="url"
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                if (link && !/^https?:\/\//i.test(link)) {
                                    toast.error('Gunakan URL http atau https.');
                                    return;
                                }
                                if (link)
                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange('link')
                                        .setLink({ href: link })
                                        .run();
                                else editor.chain().focus().unsetLink().run();
                                setLinkOpen(false);
                            }}
                        >
                            Terapkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Frame>
    );
}
