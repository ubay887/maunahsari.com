import {
    ArrowRight,
    Facebook,
    Globe,
    Instagram,
    MessageCircle,
    Youtube,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { index as articlesIndex } from '@/routes/articles';
import { SeoHead } from '@/components/site/seo-head';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { site } from '@/lib/site';

const socialIcons: Record<string, LucideIcon> = {
    Instagram,
    Facebook,
    TikTok: Globe,
    YouTube: Youtube,
};

export default function Narahubung({ canonical }: { canonical: string }) {
    return (
        <>
            <SeoHead
                title="Narahubung & Media Sosial"
                description="Kontak WhatsApp kantor putra dan putri serta media sosial resmi PTQ Ma'unah Sari Kediri."
                canonical={canonical}
            />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-8">
                <SectionHeading
                    as="h1"
                    eyebrow="Layanan komunikasi"
                    title="Narahubung & Media Sosial"
                />
                <div className="grid items-stretch gap-8 md:grid-cols-2">
                    <section className="flex flex-col gap-4">
                        <h2 className="border-b border-border pb-2 font-display text-xl font-bold text-primary">
                            Kontak administrasi
                        </h2>
                        {site.contacts.map((contact) => (
                            <Card key={contact.role} className="grow">
                                <CardHeader>
                                    <span className="text-xs font-bold tracking-wider text-gold-foreground uppercase">
                                        {contact.role} (WA)
                                    </span>
                                    <CardTitle className="font-mono text-lg font-bold text-primary tabular-nums">
                                        {contact.phone}
                                    </CardTitle>
                                    <CardDescription>
                                        {contact.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Button type="button" asChild>
                                        <a
                                            href={contact.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MessageCircle
                                                data-icon="inline-start"
                                                aria-hidden
                                            />
                                            Hubungi via WhatsApp
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="border-b border-border pb-2 font-display text-xl font-bold text-primary">
                            Media publikasi & sosial
                        </h2>
                        <ul className="grid grow auto-rows-fr grid-cols-2 gap-4">
                            {site.social.map((media) => {
                                const Icon = socialIcons[media.name] ?? Globe;

                                return (
                                    <li key={media.name} className="flex">
                                        <a
                                            href={media.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                        >
                                            <Card className="w-full justify-between transition-colors hover:bg-accent">
                                                <CardContent className="flex flex-col gap-4">
                                                    <Icon
                                                        aria-hidden
                                                        className="size-6 text-gold-foreground"
                                                    />
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                            {media.name}
                                                        </span>
                                                        <span className="truncate text-sm font-semibold text-primary">
                                                            {media.handle}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                        <Card className="grow">
                            <CardHeader>
                                <span className="text-xs font-bold tracking-wider text-gold-foreground uppercase">
                                    Warta & karya santri
                                </span>
                                <CardTitle className="font-display text-base font-bold text-primary">
                                    Artikel Ma'unah Sari
                                </CardTitle>
                                <CardDescription>
                                    Info berkala, tulisan sastra, artikel
                                    keislaman, serta karya santri yang
                                    diterbitkan di situs ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button type="button" variant="gold" asChild>
                                    <Link href={articlesIndex()}>
                                        Baca artikel
                                        <ArrowRight
                                            data-icon="inline-end"
                                            aria-hidden
                                        />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}
