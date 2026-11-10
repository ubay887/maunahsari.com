import { usePage } from '@inertiajs/react';
import { Award, BookOpen, BookOpenCheck, MapPin, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { ArticleContent } from '@/components/article-content';
import { SectionHeading } from '@/components/site/section-heading';
import { SeoHead } from '@/components/site/seo-head';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { images } from '@/lib/site';
import type { ProfileContent, SiteInfo } from '@/types/site';

function Subheading({ children }: { children: ReactNode }) {
    return (
        <h3 className="border-b border-border pb-2 font-display text-xl font-bold text-primary">
            {children}
        </h3>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground marker:text-gold">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}

export default function Profil({
    canonical,
    content,
}: {
    canonical: string;
    content: ProfileContent;
}) {
    const { siteInfo } = usePage<{ siteInfo: SiteInfo }>().props;
    const { founder, caretaker } = content;

    return (
        <>
            <SeoHead
                title="Profil Pesantren"
                description="Sejarah, pendiri, dan pengasuh Pesantren Tahfidhul Qur'an Ma'unah Sari, Kediri."
                canonical={canonical}
            />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-8">
                <SectionHeading
                    as="h1"
                    eyebrow="Mengenal lebih dekat"
                    title="Profil Pesantren"
                />
                <Tabs defaultValue="sejarah" className="gap-6">
                    <TabsList
                        variant="line"
                        className="h-auto w-full justify-center gap-x-2"
                    >
                        <TabsTrigger
                            value="sejarah"
                            className="flex-none px-3 py-2"
                        >
                            <BookOpen aria-hidden />
                            Sejarah & lokasi
                        </TabsTrigger>
                        <TabsTrigger
                            value="pendiri"
                            className="flex-none px-3 py-2"
                        >
                            <User aria-hidden />
                            Pendiri
                        </TabsTrigger>
                        <TabsTrigger
                            value="pengasuh"
                            className="flex-none px-3 py-2"
                        >
                            <Award aria-hidden />
                            Pengasuh
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sejarah">
                        <Card>
                            <CardContent className="flex flex-col gap-6">
                                <Subheading>
                                    Sejarah berdiri pesantren
                                </Subheading>
                                <div className="grid items-start gap-6 md:grid-cols-[14rem_1fr]">
                                    <img
                                        src={images.profileCover}
                                        alt="Papan nama Pesantren Al-Qur'an Ma'unah Sari"
                                        width={372}
                                        height={393}
                                        className="w-full max-w-56 rounded-xl border border-border object-cover"
                                    />
                                    <ArticleContent
                                        html={content.history_html}
                                    />
                                </div>
                                <Subheading>
                                    <span className="flex items-center gap-2">
                                        <MapPin
                                            aria-hidden
                                            className="size-5 text-gold-foreground"
                                        />
                                        Lokasi geografis
                                    </span>
                                </Subheading>
                                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                    <p>
                                        Secara geografis, PTQ Ma'unah Sari
                                        terletak di sebelah barat sungai Brantas
                                        yang beralamatkan di:
                                    </p>
                                    <address className="border-l-4 border-gold bg-primary/5 p-4 font-semibold text-primary not-italic">
                                        {siteInfo.address}
                                    </address>
                                    <ArticleContent
                                        html={content.location_html}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pendiri">
                        <Card>
                            <CardHeader>
                                <span className="text-xs font-bold tracking-wider text-gold-foreground uppercase">
                                    Mengenal muassis
                                </span>
                                <CardTitle className="font-display text-2xl font-bold text-primary">
                                    {founder.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6">
                                {founder.facts.length > 0 && (
                                    <dl className="grid gap-3 border border-border bg-primary/5 p-4 text-sm sm:grid-cols-2">
                                        {founder.facts.map((fact, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-1"
                                            >
                                                <dt className="font-semibold text-primary">
                                                    {fact.label}:
                                                </dt>
                                                <dd className="text-muted-foreground">
                                                    {fact.value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                                <Subheading>Riwayat & karakter</Subheading>
                                <ArticleContent html={founder.bio_html} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pengasuh">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={images.gusHamid}
                                        alt={caretaker.name}
                                        width={64}
                                        height={64}
                                        className="size-16 shrink-0 rounded-full border-2 border-gold object-cover"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold tracking-wider text-gold-foreground uppercase">
                                            {caretaker.period}
                                        </span>
                                        <CardTitle className="font-display text-2xl font-bold text-primary">
                                            {caretaker.name}
                                        </CardTitle>
                                    </div>
                                </div>
                                {caretaker.lineage && (
                                    <CardDescription className="pt-2">
                                        {caretaker.lineage}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6">
                                <Subheading>Biografi singkat</Subheading>
                                <ArticleContent html={caretaker.bio_html} />
                                {(caretaker.works.length > 0 ||
                                    caretaker.organizations.length > 0) && (
                                    <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
                                        {caretaker.works.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
                                                    <BookOpenCheck
                                                        aria-hidden
                                                        className="size-4 text-gold-foreground"
                                                    />
                                                    Karya tulis
                                                </h4>
                                                <BulletList
                                                    items={caretaker.works}
                                                />
                                            </div>
                                        )}
                                        {caretaker.organizations.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
                                                    <Award
                                                        aria-hidden
                                                        className="size-4 text-gold-foreground"
                                                    />
                                                    Aktivitas organisasi
                                                </h4>
                                                <BulletList
                                                    items={
                                                        caretaker.organizations
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
