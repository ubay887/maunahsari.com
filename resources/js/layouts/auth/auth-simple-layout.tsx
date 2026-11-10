import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { IslamicPattern } from '@/components/site/islamic-pattern';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { images, site } from '@/lib/site';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-between gap-6 overflow-hidden surface-forest bg-linear-to-br from-[oklch(0.3_0.08_160)] via-[oklch(0.22_0.06_160)] to-[oklch(0.17_0.04_160)] p-4 text-sm">
            <IslamicPattern
                variant="sparse-star"
                className="pointer-events-none absolute inset-0 text-gold opacity-[0.07]"
            />
            <main className="relative flex w-full flex-1 items-center justify-center py-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="items-center gap-1 text-center">
                        <Link
                            href={home()}
                            aria-label="Halaman depan"
                            className="mb-3 justify-self-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <img
                                src={images.seal}
                                alt=""
                                width={96}
                                height={96}
                                className="size-24 rounded-full object-contain"
                            />
                        </Link>
                        <CardTitle className="font-display text-2xl font-bold tracking-tight text-primary">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription>{description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {children}
                    </CardContent>
                </Card>
            </main>
            <footer className="relative flex flex-col items-center gap-2 pb-2 text-center text-xs text-white/55">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-gold transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <ArrowLeft aria-hidden className="size-3.5" />
                    Kembali ke beranda
                </Link>
                <span>
                    &copy; {new Date().getFullYear()} {site.name} Kediri. Hak
                    cipta dilindungi.
                </span>
            </footer>
        </div>
    );
}
