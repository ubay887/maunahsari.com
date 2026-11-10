import { router } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PortalPage } from '@/components/alumni/portal-page';
import { EmptyState } from '@/components/empty-state';
import { Pager } from '@/components/portal/kit';
import { Badge } from '@/components/reui/badge';
import { Frame, FramePanel } from '@/components/reui/frame';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useArticlePageState } from '@/hooks/use-article-page-state';
import { useInitials } from '@/hooks/use-initials';
import { alumniLabels } from '@/lib/alumni';
import { index, show, update } from '@/routes/alumni/contacts';
import type { AlumniContact } from '@/types/alumni';
import type { Paginated } from '@/types/article';

type Direction = 'all' | 'incoming' | 'outgoing';

const statusVariant = {
    approved: 'success-light',
    pending: 'warning-light',
} as const;

function ContactRow({ contact }: { contact: AlumniContact }) {
    const getInitials = useInitials();
    const [pending, setPending] = useState(false);
    const [revealed, setRevealed] = useState<{
        phone: string;
        email: string;
    } | null>(null);
    const [failed, setFailed] = useState(false);
    const name = contact.other?.full_name ?? 'Alumni';

    function respond(status: string) {
        setPending(true);
        router.put(
            update.url(contact.id),
            { status },
            {
                onFinish: () => setPending(false),
                onError: () => toast.error('Jawaban belum tersimpan'),
            },
        );
    }

    async function reveal() {
        setPending(true);
        setFailed(false);
        try {
            const response = await fetch(show.url(contact.id), {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });
            if (!response.ok) throw new Error();
            const data: unknown = await response.json();
            if (typeof data !== 'object' || data === null) throw new Error();
            setRevealed({
                phone:
                    'phone_whatsapp' in data &&
                    typeof data.phone_whatsapp === 'string'
                        ? data.phone_whatsapp
                        : 'Tidak tersedia',
                email:
                    'email' in data && typeof data.email === 'string'
                        ? data.email
                        : 'Tidak tersedia',
            });
        } catch {
            setFailed(true);
        } finally {
            setPending(false);
        }
    }

    return (
        <FramePanel className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <Avatar className="size-10">
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium break-words">
                        {name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {contact.incoming
                            ? 'Permintaan masuk'
                            : 'Permintaan keluar'}
                    </span>
                </div>
                <Badge
                    variant={
                        statusVariant[
                            contact.status as keyof typeof statusVariant
                        ] ?? 'destructive-light'
                    }
                >
                    {alumniLabels[contact.status] ?? contact.status}
                </Badge>
            </div>
            <p className="text-sm break-words">{contact.message}</p>
            {contact.incoming && contact.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        disabled={pending}
                        onClick={() => respond('approved')}
                    >
                        Setujui
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={() => respond('declined')}
                    >
                        Tolak
                    </Button>
                </div>
            )}
            {!contact.incoming && contact.status === 'approved' && (
                <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => void reveal()}
                >
                    Lihat kontak
                </Button>
            )}
            {failed && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-2 text-sm"
                >
                    <p>Kontak tidak dapat dibuka.</p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void reveal()}
                    >
                        Coba lagi
                    </Button>
                </div>
            )}
            {revealed && (
                <div
                    role="status"
                    className="flex flex-col gap-1 text-sm break-all"
                >
                    <p>WhatsApp: {revealed.phone}</p>
                    <p>Email: {revealed.email}</p>
                </div>
            )}
        </FramePanel>
    );
}

export default function ContactsPage({
    contacts,
}: {
    contacts: Paginated<AlumniContact>;
}) {
    const page = useArticlePageState();
    const [direction, setDirection] = useState<Direction>('all');
    const waiting = contacts.data.filter(
        (contact) => contact.incoming && contact.status === 'pending',
    ).length;
    const visible = contacts.data.filter(
        (contact) =>
            direction === 'all' ||
            (direction === 'incoming') === contact.incoming,
    );

    return (
        <PortalPage
            title="Kontak"
            description="Permintaan kontak masuk dan keluar."
        >
            <Tabs
                value={direction}
                onValueChange={(value) => setDirection(value as Direction)}
            >
                <TabsList className="w-full">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="incoming">
                        Masuk
                        {waiting > 0 && (
                            <Badge variant="warning-light">{waiting}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">Keluar</TabsTrigger>
                </TabsList>
            </Tabs>
            <Frame spacing="default">
                {visible.length ? (
                    visible.map((contact) => (
                        <ContactRow key={contact.id} contact={contact} />
                    ))
                ) : (
                    <FramePanel>
                        <EmptyState
                            icon={Inbox}
                            title="Belum ada permintaan"
                            description="Permintaan masuk atau keluar akan muncul di sini."
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={page.retry}
                                >
                                    Muat ulang
                                </Button>
                            }
                        />
                    </FramePanel>
                )}
            </Frame>
            <Pager
                current={contacts.current_page}
                last={contacts.last_page}
                onPage={(next) => router.get(index.url(), { page: next })}
            />
        </PortalPage>
    );
}
