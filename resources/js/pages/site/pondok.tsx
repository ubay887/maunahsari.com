import { Award, BookOpen, CircleHelp, Clock, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import { SeoHead } from '@/components/site/seo-head';
import { SectionHeading } from '@/components/site/section-heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { pondokMeta } from '@/lib/pondok';
import type { PondokKey } from '@/lib/pondok';
import type { PondokContent } from '@/types/site';

function BlockHeading({
    icon: Icon,
    children,
}: {
    icon: typeof BookOpen;
    children: string;
}) {
    return (
        <h2 className="flex items-center gap-2 border-b border-border pb-2 font-display text-xl font-bold text-primary md:text-2xl">
            <Icon aria-hidden className="size-5 text-gold-foreground" />
            {children}
        </h2>
    );
}

export default function Pondok({
    pondok,
    canonical,
    content: data,
}: {
    pondok: PondokKey;
    canonical: string;
    content: PondokContent;
}) {
    const content = {
        ...pondokMeta[pondok],
        ...data,
        quotaNote: data.quota_note,
    };

    return (
        <>
            <SeoHead
                title={content.title}
                description={`Program pembelajaran, kegiatan harian, dan fasilitas ${content.title} PTQ Ma'unah Sari Kediri.`}
                canonical={canonical}
            />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-8">
                <div className="flex flex-col items-center gap-6">
                    <SectionHeading
                        as="h1"
                        eyebrow={content.eyebrow}
                        title={content.title}
                    />
                    <img
                        src={content.cover}
                        alt={content.coverAlt}
                        width={226}
                        height={385}
                        className="aspect-video w-full max-w-md rounded-xl border border-border object-cover object-top"
                    />
                </div>

                <section className="flex flex-col gap-6">
                    <BlockHeading icon={BookOpen}>
                        Program pembelajaran
                    </BlockHeading>
                    <div className="grid gap-4 md:grid-cols-2">
                        {content.programs.map((program, index) => (
                            <Card key={program.title}>
                                <CardHeader>
                                    <span className="text-xs font-bold tracking-widest text-gold-foreground uppercase">
                                        Program {index + 1}
                                    </span>
                                    <CardTitle className="font-display text-lg font-bold text-primary">
                                        {program.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {program.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="border-l-2 border-gold bg-primary/5 p-2.5 text-xs text-muted-foreground">
                                        <strong className="text-foreground">
                                            Target:
                                        </strong>{' '}
                                        {program.target}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="grid items-start gap-8 md:grid-cols-2">
                    <section className="flex flex-col gap-6">
                        <BlockHeading icon={Clock}>
                            Kegiatan harian
                        </BlockHeading>
                        <ul className="flex flex-col gap-4">
                            {content.activities.map((activity) => (
                                <li
                                    key={activity.title}
                                    className="flex flex-col gap-1.5"
                                >
                                    <Badge variant="primary-light">
                                        {activity.time}
                                    </Badge>
                                    <h3 className="text-sm font-semibold text-primary">
                                        {activity.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="flex flex-col gap-6">
                        <BlockHeading icon={Award}>
                            Fasilitas & ketentuan
                        </BlockHeading>
                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xs font-bold tracking-wider text-primary uppercase">
                                        {content.facilitiesLabel}
                                    </h3>
                                    <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                        {content.facilities.map((facility) => (
                                            <li
                                                key={facility}
                                                className="flex items-center gap-2"
                                            >
                                                <Check
                                                    aria-hidden
                                                    className="size-4 shrink-0 text-success"
                                                />
                                                {facility}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Alert variant="warning">
                                    <CircleHelp aria-hidden />
                                    <AlertTitle>Ketentuan kuota</AlertTitle>
                                    <AlertDescription>
                                        {content.quotaNote}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}
