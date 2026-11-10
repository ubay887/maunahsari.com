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
import type { ProfileContent } from '@/types/site';
import { RichField, TextAreaField, TextField } from './site-fields';
import { SiteFormFrame, errorAt } from './site-form-frame';

export default function ProfileForm({ content }: { content: ProfileContent }) {
    const form = useForm<ProfileContent>({
        ...content,
        caretaker: {
            ...content.caretaker,
            lineage: content.caretaker.lineage ?? '',
        },
    });
    const errors = form.errors as Record<string, string | undefined>;
    const { founder, caretaker } = form.data;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url('profile'), {
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
                    <FrameTitle>Sejarah dan lokasi</FrameTitle>
                    <FrameDescription>
                        Alamat diatur di halaman Narahubung & identitas.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    <RichField
                        label="Sejarah berdiri"
                        value={form.data.history_html}
                        disabled={form.processing}
                        onChange={(html) => form.setData('history_html', html)}
                        error={form.errors.history_html}
                    />
                    <RichField
                        label="Keterangan afiliasi (di bawah alamat)"
                        value={form.data.location_html}
                        disabled={form.processing}
                        onChange={(html) => form.setData('location_html', html)}
                        error={form.errors.location_html}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Pendiri</FrameTitle>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    <TextField
                        id="founder-name"
                        label="Nama lengkap"
                        value={founder.name}
                        onChange={(name) =>
                            form.setData('founder', { ...founder, name })
                        }
                        error={errorAt(errors, 'founder.name')}
                    />
                    <RepeaterField
                        label="Data singkat"
                        itemLabel="Data"
                        addLabel="Tambah data"
                        max={10}
                        items={founder.facts}
                        error={errorAt(errors, 'founder.facts')}
                        onChange={(facts) =>
                            form.setData('founder', { ...founder, facts })
                        }
                        createItem={() => ({ label: '', value: '' })}
                        renderItem={(item, index, change) => (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    id={`fact-label-${index}`}
                                    label="Label"
                                    maxLength={120}
                                    value={item.label}
                                    onChange={(label) =>
                                        change({ ...item, label })
                                    }
                                    error={errorAt(
                                        errors,
                                        `founder.facts.${index}.label`,
                                    )}
                                />
                                <TextField
                                    id={`fact-value-${index}`}
                                    label="Isi"
                                    value={item.value}
                                    onChange={(value) =>
                                        change({ ...item, value })
                                    }
                                    error={errorAt(
                                        errors,
                                        `founder.facts.${index}.value`,
                                    )}
                                />
                            </div>
                        )}
                    />
                    <RichField
                        label="Riwayat dan karakter"
                        value={founder.bio_html}
                        disabled={form.processing}
                        onChange={(bio_html) =>
                            form.setData('founder', { ...founder, bio_html })
                        }
                        error={errorAt(errors, 'founder.bio_html')}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Pengasuh</FrameTitle>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="caretaker-period"
                            label="Periode"
                            value={caretaker.period}
                            onChange={(period) =>
                                form.setData('caretaker', {
                                    ...caretaker,
                                    period,
                                })
                            }
                            error={errorAt(errors, 'caretaker.period')}
                        />
                        <TextField
                            id="caretaker-name"
                            label="Nama lengkap"
                            value={caretaker.name}
                            onChange={(name) =>
                                form.setData('caretaker', {
                                    ...caretaker,
                                    name,
                                })
                            }
                            error={errorAt(errors, 'caretaker.name')}
                        />
                    </div>
                    <TextAreaField
                        id="caretaker-lineage"
                        label="Kelahiran dan nasab"
                        maxLength={500}
                        value={caretaker.lineage ?? ''}
                        onChange={(lineage) =>
                            form.setData('caretaker', {
                                ...caretaker,
                                lineage,
                            })
                        }
                        error={errorAt(errors, 'caretaker.lineage')}
                    />
                    <RichField
                        label="Biografi singkat"
                        value={caretaker.bio_html}
                        disabled={form.processing}
                        onChange={(bio_html) =>
                            form.setData('caretaker', {
                                ...caretaker,
                                bio_html,
                            })
                        }
                        error={errorAt(errors, 'caretaker.bio_html')}
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        <RepeaterField
                            label="Karya tulis"
                            itemLabel="Karya"
                            addLabel="Tambah karya"
                            items={caretaker.works}
                            error={errorAt(errors, 'caretaker.works')}
                            onChange={(works) =>
                                form.setData('caretaker', {
                                    ...caretaker,
                                    works,
                                })
                            }
                            createItem={() => ''}
                            renderItem={(item, index, change) => (
                                <TextField
                                    id={`work-${index}`}
                                    label="Judul"
                                    value={item}
                                    onChange={change}
                                    error={errorAt(
                                        errors,
                                        `caretaker.works.${index}`,
                                    )}
                                />
                            )}
                        />
                        <RepeaterField
                            label="Aktivitas organisasi"
                            itemLabel="Aktivitas"
                            addLabel="Tambah aktivitas"
                            items={caretaker.organizations}
                            error={errorAt(errors, 'caretaker.organizations')}
                            onChange={(organizations) =>
                                form.setData('caretaker', {
                                    ...caretaker,
                                    organizations,
                                })
                            }
                            createItem={() => ''}
                            renderItem={(item, index, change) => (
                                <TextField
                                    id={`organization-${index}`}
                                    label="Jabatan dan periode"
                                    value={item}
                                    onChange={change}
                                    error={errorAt(
                                        errors,
                                        `caretaker.organizations.${index}`,
                                    )}
                                />
                            )}
                        />
                    </div>
                </FramePanel>
            </Frame>
        </SiteFormFrame>
    );
}
