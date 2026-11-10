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
import type { PondokContent, SitePageKey } from '@/types/site';
import { TextAreaField, TextField } from './site-fields';
import { SiteFormFrame, errorAt } from './site-form-frame';

export default function PondokForm({
    pageKey,
    content,
}: {
    pageKey: SitePageKey;
    content: PondokContent;
}) {
    const form = useForm<PondokContent>(content);
    const errors = form.errors as Record<string, string | undefined>;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url(pageKey), {
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
                    <FrameTitle>Program pembelajaran</FrameTitle>
                    <FrameDescription>
                        Tampil sebagai kartu bernomor, sesuai urutan di sini.
                    </FrameDescription>
                </FrameHeader>
                <FramePanel>
                    <RepeaterField
                        label="Daftar program"
                        itemLabel="Program"
                        addLabel="Tambah program"
                        min={1}
                        max={12}
                        items={form.data.programs}
                        error={form.errors.programs}
                        onChange={(programs) =>
                            form.setData('programs', programs)
                        }
                        createItem={() => ({
                            title: '',
                            description: '',
                            target: '',
                        })}
                        renderItem={(item, index, change) => (
                            <div className="flex flex-col gap-4">
                                <TextField
                                    id={`program-title-${index}`}
                                    label="Nama program"
                                    maxLength={120}
                                    value={item.title}
                                    onChange={(title) =>
                                        change({ ...item, title })
                                    }
                                    error={errorAt(
                                        errors,
                                        `programs.${index}.title`,
                                    )}
                                />
                                <TextAreaField
                                    id={`program-description-${index}`}
                                    label="Deskripsi"
                                    rows={4}
                                    maxLength={1000}
                                    value={item.description}
                                    onChange={(description) =>
                                        change({ ...item, description })
                                    }
                                    error={errorAt(
                                        errors,
                                        `programs.${index}.description`,
                                    )}
                                />
                                <TextField
                                    id={`program-target-${index}`}
                                    label="Target"
                                    maxLength={500}
                                    value={item.target}
                                    onChange={(target) =>
                                        change({ ...item, target })
                                    }
                                    error={errorAt(
                                        errors,
                                        `programs.${index}.target`,
                                    )}
                                />
                            </div>
                        )}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Kegiatan harian</FrameTitle>
                </FrameHeader>
                <FramePanel>
                    <RepeaterField
                        label="Jadwal kegiatan"
                        itemLabel="Kegiatan"
                        addLabel="Tambah kegiatan"
                        max={12}
                        items={form.data.activities}
                        error={form.errors.activities}
                        onChange={(activities) =>
                            form.setData('activities', activities)
                        }
                        createItem={() => ({
                            time: '',
                            title: '',
                            description: '',
                        })}
                        renderItem={(item, index, change) => (
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        id={`activity-time-${index}`}
                                        label="Waktu"
                                        maxLength={80}
                                        hint="Contoh: 20:00 - 21:00 WIB"
                                        value={item.time}
                                        onChange={(time) =>
                                            change({ ...item, time })
                                        }
                                        error={errorAt(
                                            errors,
                                            `activities.${index}.time`,
                                        )}
                                    />
                                    <TextField
                                        id={`activity-title-${index}`}
                                        label="Nama kegiatan"
                                        maxLength={160}
                                        value={item.title}
                                        onChange={(title) =>
                                            change({ ...item, title })
                                        }
                                        error={errorAt(
                                            errors,
                                            `activities.${index}.title`,
                                        )}
                                    />
                                </div>
                                <TextAreaField
                                    id={`activity-description-${index}`}
                                    label="Keterangan"
                                    maxLength={500}
                                    value={item.description}
                                    onChange={(description) =>
                                        change({ ...item, description })
                                    }
                                    error={errorAt(
                                        errors,
                                        `activities.${index}.description`,
                                    )}
                                />
                            </div>
                        )}
                    />
                </FramePanel>
            </Frame>
            <Frame>
                <FrameHeader>
                    <FrameTitle>Fasilitas dan kuota</FrameTitle>
                </FrameHeader>
                <FramePanel className="flex flex-col gap-6">
                    <RepeaterField
                        label="Fasilitas utama"
                        itemLabel="Fasilitas"
                        addLabel="Tambah fasilitas"
                        items={form.data.facilities}
                        error={form.errors.facilities}
                        onChange={(facilities) =>
                            form.setData('facilities', facilities)
                        }
                        createItem={() => ''}
                        renderItem={(item, index, change) => (
                            <TextField
                                id={`facility-${index}`}
                                label="Fasilitas"
                                maxLength={160}
                                value={item}
                                onChange={change}
                                error={errorAt(errors, `facilities.${index}`)}
                            />
                        )}
                    />
                    <TextAreaField
                        id="quota-note"
                        label="Ketentuan kuota"
                        rows={4}
                        value={form.data.quota_note}
                        onChange={(value) => form.setData('quota_note', value)}
                        error={form.errors.quota_note}
                    />
                </FramePanel>
            </Frame>
        </SiteFormFrame>
    );
}
