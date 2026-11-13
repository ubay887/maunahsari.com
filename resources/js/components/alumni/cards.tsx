import { useForm } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import InputError from '@/components/input-error';
import { Badge } from '@/components/reui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { useInitials } from '@/hooks/use-initials';
import { alumniLabels } from '@/lib/alumni';
import { store } from '@/routes/alumni/contacts';
import type { AlumniCard } from '@/types/alumni';

const chipKeys = [
    'angkatan',
    'pondok',
    'regency',
    'province',
    'program',
] as const;

function AlumniCardItem({
    profile,
    onRequest,
}: {
    profile: AlumniCard;
    onRequest: () => void;
}) {
    const getInitials = useInitials();
    const name = profile.full_name ?? 'Alumni';
    const nickname = profile.nickname?.trim();
    const subtitle = [profile.profession, profile.organization]
        .filter(Boolean)
        .join(' · ');
    const chips = chipKeys
        .filter((key) => profile[key] != null && profile[key] !== '')
        .map((key) => {
            const value = String(profile[key]);
            const label = alumniLabels[value] ?? value;

            return key === 'angkatan' ? `Angkatan ${label}` : label;
        });
    const links = Object.entries(profile.social_links ?? {}).filter(
        ([, value]) => /^https?:\/\//.test(value),
    );

    return (
        <Card size="sm" className="min-w-0">
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                        {profile.photo && (
                            <AvatarImage src={profile.photo} alt="" />
                        )}
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <h3 className="text-sm font-semibold break-words">
                            {name}
                            {nickname && (
                                <span className="font-normal text-muted-foreground">
                                    {' '}
                                    ({nickname})
                                </span>
                            )}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {profile.distance_band && (
                        <Badge variant="outline" className="shrink-0">
                            {profile.distance_band}
                        </Badge>
                    )}
                </div>
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {chips.map((chip) => (
                            <Badge key={chip} variant="outline">
                                {chip}
                            </Badge>
                        ))}
                    </div>
                )}
                {profile.bio && (
                    <p className="line-clamp-3 text-sm break-words">
                        {profile.bio}
                    </p>
                )}
                {profile.skills?.length ? (
                    <p className="text-xs text-muted-foreground">
                        Keahlian: {profile.skills.join(', ')}
                    </p>
                ) : null}
                {profile.open_to?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {profile.open_to.map((value) => (
                            <Badge key={value} variant="primary-light">
                                {alumniLabels[value] ?? value}
                            </Badge>
                        ))}
                    </div>
                ) : null}
                {links.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {links.map(([key, value]) => (
                            <a
                                key={key}
                                href={value}
                                className="text-xs text-primary underline-offset-4 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {key}
                            </a>
                        ))}
                    </div>
                )}
                <Button type="button" variant="outline" onClick={onRequest}>
                    Minta kontak
                </Button>
            </CardContent>
        </Card>
    );
}

function CardsSkeleton() {
    return (
        <div
            role="status"
            aria-label="Memuat alumni"
            className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
            {[0, 1, 2].map((item) => (
                <Card key={item} size="sm">
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-12 rounded-full" />
                            <div className="flex flex-1 flex-col gap-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function AlumniCards({
    profiles,
    onEmpty,
}: {
    profiles: AlumniCard[];
    onEmpty: () => void;
}) {
    const [target, setTarget] = useState<AlumniCard | null>(null);
    const form = useForm({ message: '' });
    const { loading } = useArticlePageState();

    return (
        <>
            {loading ? (
                <CardsSkeleton />
            ) : profiles.length ? (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profiles.map((profile) => (
                        <AlumniCardItem
                            key={profile.id}
                            profile={profile}
                            onRequest={() => {
                                form.reset();
                                form.clearErrors();
                                setTarget(profile);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    bordered
                    icon={SearchX}
                    title="Alumni tidak ditemukan"
                    description="Tidak ada alumni yang dapat ditampilkan."
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onEmpty}
                        >
                            Reset pencarian
                        </Button>
                    }
                />
            )}
            <Dialog
                open={target !== null}
                onOpenChange={(open) => {
                    if (!form.processing && !open) setTarget(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Minta kontak</DialogTitle>
                        <DialogDescription>
                            Pemilik profil akan menyetujui atau menolak
                            permintaan Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (target)
                                form.submit(store(target.id), {
                                    onSuccess: () => {
                                        setTarget(null);
                                        toast.success('Permintaan terkirim');
                                    },
                                });
                        }}
                    >
                        <Field>
                            <FieldLabel htmlFor="contact-message">
                                Pesan (maksimal 300 karakter)
                            </FieldLabel>
                            <Textarea
                                id="contact-message"
                                required
                                maxLength={300}
                                value={form.data.message}
                                onChange={(event) =>
                                    form.setData('message', event.target.value)
                                }
                            />
                            <InputError message={form.errors.message} />
                        </Field>
                        <Button type="submit" disabled={form.processing}>
                            Kirim permintaan
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
