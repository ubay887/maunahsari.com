import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    BookOpenCheck,
    Clock,
    Heart,
    Moon,
    Newspaper,
    Quote,
    School,
    ShieldCheck,
    Sparkles,
    Sun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { Badge } from '@/components/reui/badge';
import {
    IslamicPattern,
    OrnamentalCorner,
    SectionDivider,
} from '@/components/site/islamic-pattern';
import { ScrollSlider } from '@/components/site/scroll-slider';
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { images, site } from '@/lib/site';
import { index as articlesIndex } from '@/routes/articles';
import { index as psbIndex } from '@/routes/psb';
import { contact, profile } from '@/routes/site';
import type { Article } from '@/types/article';

type Period = {
    id: number;
    name: string;
    academic_year: string | null;
    closes_at: string | null;
};

const strengths: { title: string; description: string; icon: LucideIcon }[] = [
    {
        title: "Sanad Al-Qur'an Muttashil",
        description:
            'Sanad tahfidh bersambung mulia melalui jalur Al-Muqri Al-Hafidz KH. R. Munawwir Krapyak Yogyakarta hingga Rasulullah SAW.',
        icon: ShieldCheck,
    },
    {
        title: 'Integrasi Nilai Tasawuf',
        description:
            'Mengedepankan keluhuran akhlak, riyadhah spiritual, pembiasaan shalat berjamaah awal waktu, dan aurad zikir Masyayikh.',
        icon: Heart,
    },
    {
        title: 'Metode Sorogan Klasik',
        description:
            "Bimbingan privat (one-on-one) setoran Al-Qur'an (bin-nadhor & bil-hifdhi) untuk akurasi tinggi makhraj dan tajwid santri.",
        icon: Sparkles,
    },
    {
        title: "Lingkungan Qur'ani",
        description:
            'Suasana tenang dan religius khas kota Kediri di barat Sungai Brantas, sangat kondusif untuk fokus menghafal kalam ilahi.',
        icon: School,
    },
];

const programs: { title: string; description: string; icon: LucideIcon }[] = [
    {
        title: 'Program Bin-Nadhor',
        description:
            "Pembiasaan melafalkan Al-Qur'an secara tartil dengan melihat mushaf. Ditujukan untuk memantapkan hukum tajwid, makharijul huruf, dan waqaf ibtida' sebelum santri memulai program hafalan.",
        icon: BookOpen,
    },
    {
        title: 'Program Bil-Hifdhi (Tahfidh)',
        description:
            "Program menghafal Al-Qur'an 30 Juz secara mandiri dan terstruktur. Disetorkan secara sorogan satu-satu (privat) setiap subuh kepada pengasuh atau dewan ustadz/ustadzah untuk hasil ingatan yang kokoh.",
        icon: BookOpenCheck,
    },
    {
        title: "Qira'ah Sab'ah",
        description:
            "Pendalaman ragam riwayat qira'ah dari tujuh imam besar yang mutawatir. Program tingkat lanjut bagi santri senior yang telah khatam bil-hifdhi 30 Juz serta lulus uji kelayakan.",
        icon: Award,
    },
    {
        title: 'Madrasah Diniyyah & Kitab',
        description:
            "Integrasi materi fiqih ibadah praktis, adab, tauhid, akhlak tasawuf, dan kaidah Pegon. Santri menyeimbangkan hafalan ayat Al-Qur'an dengan pemahaman syariat yang benar.",
        icon: Clock,
    },
];

const schedule: {
    id: string;
    time: string;
    title: string;
    description: string;
    detail: string;
    icon: LucideIcon;
}[] = [
    {
        id: 'subuh',
        time: '04:30 - 06:00',
        title: 'Setoran Pagi',
        icon: Sun,
        description:
            "Setoran hafalan baru atau muroja'ah kepada Pengasuh atau Ustadz/Ustadzah setelah shalat Subuh.",
        detail: "Waktu utama saat pikiran santri masih segar untuk menyetorkan hafalan Al-Qur'an terbaiknya.",
    },
    {
        id: 'deresan-siang',
        time: '14:30 - 15:30',
        title: 'Deresan Siang',
        icon: Clock,
        description:
            "Mempersiapkan hafalan (muroja'ah mandiri) secara individu maupun berkelompok sebelum setoran berikutnya.",
        detail: 'Santri saling menyimak bacaan satu sama lain untuk memperkuat ketepatan tajwid dan kelancaran.',
    },
    {
        id: 'diniyyah',
        time: '20:00 - 21:00',
        title: 'Madrasah Diniyyah',
        icon: BookOpen,
        description:
            'Pembelajaran kitab kuning dan penjenjangan pemahaman aksara Pegon (Kelas I & Kelas II/IV).',
        detail: 'Mendalami hukum fiqih, tafsir, dan tata bahasa Arab agar hafalan seimbang dengan pemahaman syariat.',
    },
    {
        id: 'deresan-malam',
        time: '21:30 - Selesai',
        title: 'Deresan Malam',
        icon: Moon,
        description:
            "Muroja'ah lanjutan sebelum istirahat malam untuk memantapkan hafalan yang telah disetorkan.",
        detail: 'Dilakukan dengan khidmat agar ayat-ayat suci tertanam dalam memori jangka panjang.',
    },
];

const quotes = [
    {
        text: 'Ngaji itu harus dengan sungguh-sungguh. Kalau sudah selesai mengaji, harus dirawat dengan sungguh-sungguh (kudu diopeni sing tenanan), tetap harus dideres (diulang), sisihkan waktu untuk muroja’ah.',
        name: 'KH. R. Abdul Hamid Abdul Qodir',
        role: "Pengasuh PTQ Ma'unah Sari",
        image: images.gusHamid,
    },
    {
        text: "Sebelum mulai menghafal Al-Qur'an, alangkah baiknya mengkhatamkan atau melancarkan bacaan bin-nadhor terlebih dahulu. Dahulukan yang fardhu 'ain sebelum fardhu kifayah.",
        name: 'Agus Khalaf Muhammad Abha',
        role: 'Keluarga Pengasuh / Dewan Pengajar',
        image: images.agusKhalaf,
    },
];

const admissionSteps = [
    {
        title: 'Daftar daring atau luring',
        description:
            'Isi formulir pendaftaran melalui situs resmi atau datang langsung.',
    },
    {
        title: 'Verifikasi berkas',
        description:
            'Serahkan berkas administrasi dan ikuti tes penempatan kelas/bin-nadhor.',
    },
    {
        title: 'Masuk asrama',
        description:
            'Serah terima santri ke pihak pondok, pembagian asrama, dan orientasi.',
    },
];

function Hero() {
    return (
        <section className="relative overflow-hidden border-b-4 border-gold surface-forest pt-32 pb-16 lg:pt-40 lg:pb-24">
            <IslamicPattern
                variant="sparse-star"
                className="pointer-events-none absolute inset-0 text-gold opacity-[0.08]"
            />
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 lg:grid-cols-12">
                <div className="flex flex-col items-start gap-6 lg:col-span-7">
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                            Selamat datang di portal resmi
                        </span>
                        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-balance text-white md:text-6xl">
                            Pesantren Tahfidhul Qur'an{' '}
                            <span className="text-gold">Ma'unah Sari</span>
                        </h1>
                    </div>
                    <p className="max-w-xl text-base text-pretty text-white/80">
                        Laman informasi resmi seputar program Tahfidhul Qur'an,
                        pendaftaran santri baru, profil kepengasuhan, dan
                        kegiatan harian di PTQ Ma'unah Sari, Bandar Kidul, Kota
                        Kediri.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="gold" size="lg" asChild>
                            <Link href={psbIndex()}>
                                Daftar santri baru
                                <ArrowRight
                                    data-icon="inline-end"
                                    aria-hidden
                                />
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white dark:bg-transparent dark:hover:bg-white/10"
                            asChild
                        >
                            <Link href={profile()}>Pelajari profil kami</Link>
                        </Button>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <Card className="relative mx-auto w-full max-w-sm">
                        <OrnamentalCorner position="top-left" />
                        <OrnamentalCorner position="bottom-right" />
                        <CardContent className="flex flex-col gap-4">
                            <div
                                aria-hidden
                                className="h-1 w-12 rounded-full bg-gold"
                            />
                            <blockquote className="font-display text-base text-pretty text-foreground italic">
                                "Ngaji itu harus dengan sungguh-sungguh, kalau
                                sudah selesai mengaji harus dijaga dengan
                                sungguh-sungguh, tetap harus dideres (diulang),
                                sisihkan waktu untuk muroja'ah."
                            </blockquote>
                            <div className="flex flex-col border-t border-border pt-3">
                                <span className="text-xs font-bold tracking-wide text-primary uppercase">
                                    KH. R. Abdul Hamid Abdul Qodir
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Pengasuh PTQ Ma'unah Sari
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-center">
                                <div className="flex flex-col">
                                    <span className="font-display text-2xl font-bold text-primary tabular-nums">
                                        {site.founded} M
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Berdiri sejak
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display text-2xl font-bold text-primary">
                                        RMI NU
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Afiliasi
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function Strengths() {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16">
            <SectionHeading
                eyebrow="Selamat datang di laman informasi resmi"
                title="Menjaga Tradisi Qur'ani & Tashawwuf"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {strengths.map(({ title, description, icon: Icon }) => (
                    <Card key={title}>
                        <CardHeader>
                            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-gold-foreground">
                                <Icon aria-hidden className="size-6" />
                            </div>
                            <CardTitle className="font-display text-base font-bold text-primary">
                                {title}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function Stats({ alumniCount }: { alumniCount: number }) {
    const stats = [
        { value: String(site.founded), label: 'Tahun berdiri' },
        ...(alumniCount > 0
            ? [
                  {
                      value: new Intl.NumberFormat('id-ID').format(alumniCount),
                      label: 'Alumni terdata',
                  },
              ]
            : []),
        { value: '2', label: 'Kompleks (putra & putri)' },
        { value: '100%', label: 'Sanad muttashil' },
    ];

    return (
        <section
            aria-label="Statistik pesantren"
            className="relative overflow-hidden border-y-4 border-gold/30 surface-forest"
        >
            <IslamicPattern
                variant="star"
                className="pointer-events-none absolute inset-0 text-gold opacity-[0.05]"
            />
            <dl className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col-reverse items-center gap-1 text-center"
                    >
                        <dt className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                            {stat.label}
                        </dt>
                        <dd className="font-display text-4xl font-bold text-gold tabular-nums md:text-5xl">
                            {stat.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

function Programs() {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16">
            <SectionHeading
                eyebrow="Kurikulum khazanah"
                title="Program Pembelajaran"
            />
            <div className="grid gap-4 md:grid-cols-2">
                {programs.map(({ title, description, icon: Icon }) => (
                    <Card key={title}>
                        <CardContent className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-primary">
                                <Icon aria-hidden className="size-6" />
                            </div>
                            <div className="flex min-w-0 flex-col gap-1">
                                <h3 className="font-display text-lg font-bold text-primary">
                                    {title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function DailySchedule() {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16">
            <SectionDivider />
            <SectionHeading
                eyebrow="Dinamika harian"
                title="Kompas Rutinitas Santri"
                description="Ritme disiplin harian seorang penghafal Al-Qur'an di Ma'unah Sari, dari setoran subuh hingga deresan malam."
            />
            <Tabs defaultValue={schedule[0].id} className="gap-4">
                <TabsList
                    variant="line"
                    className="h-auto w-full flex-wrap justify-center gap-x-2"
                >
                    {schedule.map(({ id, title, icon: Icon }) => (
                        <TabsTrigger
                            key={id}
                            value={id}
                            className="flex-none px-3 py-2"
                        >
                            <Icon aria-hidden />
                            {title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {schedule.map((item) => (
                    <TabsContent key={item.id} value={item.id}>
                        <Card className="mx-auto w-full max-w-3xl">
                            <CardHeader>
                                <span className="font-mono text-xs font-bold tracking-wider text-gold-foreground uppercase tabular-nums">
                                    {item.time} WIB
                                </span>
                                <CardTitle className="font-display text-xl font-bold text-primary">
                                    {item.title}
                                </CardTitle>
                                <CardDescription>
                                    {item.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-1 border-l-4 border-gold bg-primary/5 p-3">
                                    <span className="text-xs font-bold text-primary">
                                        Filosofi & detail
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        {item.detail}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </section>
    );
}

function Masyayikh() {
    return (
        <section className="relative overflow-hidden border-y border-border bg-primary/5 py-16">
            <IslamicPattern
                variant="geometric"
                className="pointer-events-none absolute inset-0 text-primary opacity-[0.04]"
            />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
                <SectionHeading
                    eyebrow="Nasihat & petuah"
                    title="Pesan & Kalam Mutiara Masyayikh"
                />
                <div className="grid gap-4 md:grid-cols-2">
                    {quotes.map((quote) => (
                        <Card key={quote.name} className="relative">
                            <OrnamentalCorner position="top-left" />
                            <OrnamentalCorner position="bottom-right" />
                            <CardContent className="flex h-full flex-col justify-between gap-4">
                                <Quote
                                    aria-hidden
                                    className="absolute top-4 right-4 size-10 text-gold/30"
                                />
                                <blockquote className="pt-2 text-sm text-pretty text-muted-foreground italic">
                                    "{quote.text}"
                                </blockquote>
                                <div className="flex items-center gap-3 border-t border-border pt-3">
                                    <img
                                        src={quote.image}
                                        alt=""
                                        width={40}
                                        height={40}
                                        loading="lazy"
                                        className="size-10 rounded-full border-2 border-gold object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-primary">
                                            {quote.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {quote.role}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Admission({ period }: { period: Period | null }) {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-16">
            <Card>
                <img
                    src={images.psbBanner}
                    alt="Upacara di halaman PTQ Ma'unah Sari"
                    width={1280}
                    height={720}
                    loading="lazy"
                    className="aspect-video max-h-80 w-full object-cover object-center"
                />
                <CardContent className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {period ? (
                            <>
                                <Badge variant="primary-light">
                                    {period.academic_year
                                        ? `TA ${period.academic_year}`
                                        : period.name}
                                </Badge>
                                <Badge variant="success-light">
                                    Pendaftaran dibuka
                                </Badge>
                            </>
                        ) : (
                            <Badge variant="outline">
                                Pendaftaran belum dibuka
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-primary md:text-3xl">
                            Penerimaan Santri Baru (PSB) PTQ Ma'unah Sari
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Bergabunglah bersama keluarga besar penghafal
                            Al-Qur'an. Kami menerima santri baru putra dan putri
                            dengan opsi pendaftaran daring yang mudah maupun
                            luring langsung di kantor pesantren.
                        </p>
                    </div>
                    <ol className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                        {admissionSteps.map((step, index) => (
                            <li
                                key={step.title}
                                className="flex flex-col gap-1"
                            >
                                <span className="font-mono text-base font-bold text-gold-foreground tabular-nums">
                                    {String(index + 1).padStart(2, '0')}.
                                </span>
                                <h3 className="text-sm font-bold text-primary">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {step.description}
                                </p>
                            </li>
                        ))}
                    </ol>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="gold" size="lg" asChild>
                            <Link href={psbIndex()}>
                                Alur & syarat lengkap
                                <ArrowRight
                                    data-icon="inline-end"
                                    aria-hidden
                                />
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            asChild
                        >
                            <Link href={contact()}>Hubungi narahubung</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}

function LatestArticles({ articles }: { articles: Article[] }) {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-widest text-gold-foreground uppercase">
                        Kabar & catatan santri
                    </span>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
                        Warta & Artikel Pilihan
                    </h2>
                </div>
                <Button type="button" variant="ghost" asChild>
                    <Link href={articlesIndex()}>
                        Lihat semua
                        <ArrowRight data-icon="inline-end" aria-hidden />
                    </Link>
                </Button>
            </div>
            {articles.length > 0 ? (
                <ScrollSlider label="Artikel terbaru">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </ScrollSlider>
            ) : (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Newspaper aria-hidden />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada artikel terbit</EmptyTitle>
                        <EmptyDescription>
                            Kabar dan tulisan dari pesantren akan tampil di sini
                            setelah diterbitkan.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button type="button" variant="outline" asChild>
                            <Link href={articlesIndex()}>
                                Buka halaman artikel
                            </Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            )}
        </section>
    );
}

export default function Welcome({
    articles,
    period,
    alumniCount,
    canonical,
}: {
    articles: Article[];
    period: Period | null;
    alumniCount: number;
    canonical: string;
}) {
    const description =
        "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PTQ Ma'unah Sari, Kediri.";

    return (
        <>
            <SeoHead
                title="Portal Resmi Pesantren"
                description={description}
                canonical={canonical}
            >
                <script
                    head-key="organization-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'EducationalOrganization',
                            name: site.orgName,
                            alternateName: site.name,
                            url: canonical,
                            logo: new URL(images.seal, canonical).href,
                            foundingDate: String(site.founded),
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress:
                                    'Jl. KH. Agus Salim No.8, Bandar Kidul',
                                addressLocality: 'Kota Kediri',
                                addressRegion: 'Jawa Timur',
                                postalCode: '64118',
                                addressCountry: 'ID',
                            },
                            contactPoint: site.contacts.map((contact) => ({
                                '@type': 'ContactPoint',
                                contactType: contact.role,
                                telephone: `+62${contact.phone.slice(1).replaceAll('-', '')}`,
                                availableLanguage: 'id',
                            })),
                            sameAs: site.social.map((media) => media.href),
                        }).replaceAll('<', '\\u003c'),
                    }}
                />
            </SeoHead>
            <Hero />
            <Strengths />
            <Stats alumniCount={alumniCount} />
            <Programs />
            <DailySchedule />
            <Masyayikh />
            <Admission period={period} />
            <LatestArticles articles={articles} />
        </>
    );
}
