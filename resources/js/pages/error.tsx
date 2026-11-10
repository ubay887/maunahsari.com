import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { IslamicPattern } from '@/components/site/islamic-pattern';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import { contact } from '@/routes/site';

const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description:
            'Maaf, Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description:
            'Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.',
    },
    500: {
        title: 'Terjadi kesalahan',
        description:
            'Maaf, ada gangguan di server kami. Silakan coba lagi beberapa saat lagi.',
    },
    503: {
        title: 'Sedang dalam pemeliharaan',
        description:
            'Maaf, situs sedang dipelihara. Silakan kembali sebentar lagi.',
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const message = messages[status] ?? messages[500];

    return (
        <>
            <Head title={`${status}: ${message.title}`} />
            <section className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-24 text-center">
                <IslamicPattern
                    variant="sparse-star"
                    className="pointer-events-none absolute inset-0 text-gold opacity-[0.1]"
                />
                <div className="relative flex flex-col items-center gap-3">
                    <span className="font-display text-7xl font-bold text-gold-foreground tabular-nums md:text-8xl">
                        {status}
                    </span>
                    <div
                        aria-hidden
                        className="h-1 w-16 rounded-full bg-gold"
                    />
                    <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                        {message.title}
                    </h1>
                    <p className="max-w-md text-sm text-pretty text-muted-foreground">
                        {message.description}
                    </p>
                </div>
                <div className="relative flex flex-wrap items-center justify-center gap-2">
                    <Button type="button" variant="gold" size="lg" asChild>
                        <Link href={home()}>
                            <ArrowLeft data-icon="inline-start" aria-hidden />
                            Kembali ke beranda
                        </Link>
                    </Button>
                    <Button type="button" variant="outline" size="lg" asChild>
                        <Link href={contact()}>
                            <MessageCircle
                                data-icon="inline-start"
                                aria-hidden
                            />
                            Hubungi narahubung
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
