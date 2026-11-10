import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { RepeaterField } from '@/components/admin/repeater-field';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';
import { update } from '@/routes/admin/site';
import type { ContactContent } from '@/types/site';
import { TextAreaField, TextField } from './site-fields';
import { SiteFormFrame, errorAt } from './site-form-frame';

export default function ContactForm({ content }: { content: ContactContent }) {
    const form = useForm<ContactContent>({
        ...content,
        magazine_url: content.magazine_url ?? '',
    });
    const errors = form.errors as Record<string, string | undefined>;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url('contact'), {
            onSuccess: () => form.setDefaults(),
            onError: () =>
                toast.error('Perubahan belum tersimpan. Periksa isian form.'),
        });
    }

    return (
        <SiteFormFrame
            isDirty={form.isDirty}
            processing={form.processing}
            hasErrors={form.hasErrors}
            onSubmit={submit}
        >
            <Frame>
                <FrameHeader>
                    <FrameTitle>Identitas</FrameTitle>
                    <FrameDescription>
                        Tampil di footer, halaman profil, dan data terstruktur
                        mesin pencari.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    <TextAreaField
                        id="site-address"
                        label="Alamat"
                        value={form.data.address}
                        maxLength={500}
                        onChange={(value) => form.setData('address', value)}
                        error={form.errors.address}
                    />
                    <TextAreaField
                        id="site-affiliation"
                        label="Deskripsi singkat di footer"
                        value={form.data.affiliation}
                        rows={4}
                        onChange={(value) => form.setData('affiliation', value)}
                        error={form.errors.affiliation}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Kontak WhatsApp</FrameTitle>
                    <FrameDescription>
                        Tautan WhatsApp dibuat otomatis dari nomor telepon.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel>
                    <RepeaterField
                        label="Daftar kontak"
                        itemLabel="Kontak"
                        addLabel="Tambah kontak"
                        min={1}
                        max={6}
                        items={form.data.contacts}
                        error={form.errors.contacts}
                        onChange={(contacts) =>
                            form.setData('contacts', contacts)
                        }
                        createItem={() => ({
                            role: '',
                            phone: '',
                            description: '',
                        })}
                        renderItem={(item, index, change) => (
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        id={`contact-role-${index}`}
                                        label="Nama kontak"
                                        maxLength={80}
                                        value={item.role}
                                        onChange={(role) =>
                                            change({ ...item, role })
                                        }
                                        error={errorAt(
                                            errors,
                                            `contacts.${index}.role`,
                                        )}
                                    />
                                    <TextField
                                        id={`contact-phone-${index}`}
                                        label="Nomor telepon"
                                        type="tel"
                                        maxLength={20}
                                        hint="Contoh: 0812-4530-6020"
                                        value={item.phone}
                                        onChange={(phone) =>
                                            change({ ...item, phone })
                                        }
                                        error={errorAt(
                                            errors,
                                            `contacts.${index}.phone`,
                                        )}
                                    />
                                </div>
                                <TextAreaField
                                    id={`contact-description-${index}`}
                                    label="Keterangan"
                                    maxLength={500}
                                    value={item.description}
                                    onChange={(description) =>
                                        change({ ...item, description })
                                    }
                                    error={errorAt(
                                        errors,
                                        `contacts.${index}.description`,
                                    )}
                                />
                            </div>
                        )}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Media sosial</FrameTitle>
                    <FrameDescription>
                        Nama platform (Instagram, Facebook, TikTok, YouTube)
                        menentukan ikon yang tampil.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-6">
                    <RepeaterField
                        label="Akun media sosial"
                        itemLabel="Akun"
                        addLabel="Tambah akun"
                        max={10}
                        items={form.data.social}
                        error={form.errors.social}
                        onChange={(social) => form.setData('social', social)}
                        createItem={() => ({ name: '', handle: '', href: '' })}
                        renderItem={(item, index, change) => (
                            <div className="grid gap-4 sm:grid-cols-3">
                                <TextField
                                    id={`social-name-${index}`}
                                    label="Platform"
                                    maxLength={40}
                                    value={item.name}
                                    onChange={(name) =>
                                        change({ ...item, name })
                                    }
                                    error={errorAt(
                                        errors,
                                        `social.${index}.name`,
                                    )}
                                />
                                <TextField
                                    id={`social-handle-${index}`}
                                    label="Nama akun"
                                    maxLength={120}
                                    value={item.handle}
                                    onChange={(handle) =>
                                        change({ ...item, handle })
                                    }
                                    error={errorAt(
                                        errors,
                                        `social.${index}.handle`,
                                    )}
                                />
                                <TextField
                                    id={`social-href-${index}`}
                                    label="Tautan"
                                    type="url"
                                    maxLength={500}
                                    value={item.href}
                                    onChange={(href) =>
                                        change({ ...item, href })
                                    }
                                    error={errorAt(
                                        errors,
                                        `social.${index}.href`,
                                    )}
                                />
                            </div>
                        )}
                    />
                    <TextField
                        id="site-magazine"
                        label="Tautan blog majalah"
                        type="url"
                        maxLength={500}
                        hint="Kosongkan untuk menyembunyikan kartu majalah."
                        value={form.data.magazine_url ?? ''}
                        onChange={(value) =>
                            form.setData('magazine_url', value)
                        }
                        error={form.errors.magazine_url}
                    />
                </FramePanel>
            </Frame>
        </SiteFormFrame>
    );
}
