import { Link } from '@inertiajs/react';
import { ChevronRight, Circle, CircleCheck, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Href = NonNullable<ComponentProps<typeof Link>['href']>;

const rowClass =
    '-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50';

/** Judul dan keterangan satu baris, dipakai oleh baris tautan dan baris langkah. */
function RowText({
    title,
    description,
}: {
    title: string;
    description?: ReactNode;
}) {
    return (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">{title}</span>
            {description && (
                <span className="text-xs text-muted-foreground">
                    {description}
                </span>
            )}
        </span>
    );
}

/** Daftar baris dalam satu `FramePanel`, dipisah garis tipis. */
export function RowList({ children }: { children: ReactNode }) {
    return (
        <ul className="flex flex-col divide-y divide-border [&>li:first-child>*]:pt-0">
            {children}
        </ul>
    );
}

/** Baris tautan ke halaman lain: ikon, judul, keterangan, dan penanda. */
export function LinkRow({
    href,
    icon: Icon,
    title,
    description,
    trailing,
    external = false,
}: {
    href: Href;
    icon: LucideIcon;
    title: string;
    description?: ReactNode;
    trailing?: ReactNode;
    /** Buka di tab baru; `href` harus berupa alamat teks. */
    external?: boolean;
}) {
    const content = (
        <>
            <Icon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
            />
            <RowText title={title} description={description} />
            {trailing}
            {external ? (
                <ExternalLink
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
            ) : (
                <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
            )}
        </>
    );

    return (
        <li>
            {external && typeof href === 'string' ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClass}
                >
                    {content}
                </a>
            ) : (
                <Link href={href} className={rowClass}>
                    {content}
                </Link>
            )}
        </li>
    );
}

/** Langkah dalam daftar tugas: penanda selesai, judul, keterangan, dan tautan opsional. */
export function StepRow({
    done,
    title,
    description,
    href,
    trailing,
}: {
    done: boolean;
    title: string;
    description?: ReactNode;
    href?: Href;
    trailing?: ReactNode;
}) {
    const Icon = done ? CircleCheck : Circle;
    const content = (
        <>
            <Icon
                className={cn(
                    'size-4 shrink-0',
                    done ? 'text-success' : 'text-muted-foreground',
                )}
                aria-hidden
            />
            <RowText title={title} description={description} />
            {trailing}
            {href && (
                <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
            )}
        </>
    );

    return (
        <li>
            {href ? (
                <Link href={href} className={rowClass}>
                    {content}
                </Link>
            ) : (
                <div className="flex items-center gap-3 py-3">{content}</div>
            )}
        </li>
    );
}

/** Satu angka ringkasan; seluruh petak menjadi tautan bila `href` ada. */
export function Stat({
    label,
    value,
    hint,
    href,
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    href?: Href;
}) {
    const content = (
        <>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {value}
            </span>
            {hint && (
                <span className="text-xs text-muted-foreground">{hint}</span>
            )}
        </>
    );

    return href ? (
        <Link
            href={href}
            className="-m-2 flex min-w-0 flex-col gap-0.5 rounded-lg p-2 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
            {content}
        </Link>
    ) : (
        <div className="flex min-w-0 flex-col gap-0.5">{content}</div>
    );
}

/** Bilah kemajuan dengan label dan nilai di atasnya. */
export function Meter({
    label,
    valueText,
    value,
}: {
    label: string;
    valueText: string;
    value: number;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {valueText}
                </span>
            </div>
            <Progress value={value} aria-label={label} />
        </div>
    );
}

/** Pagination dua tombol selebar layar kecil: sebelumnya, halaman, berikutnya. */
export function Pager({
    current,
    last,
    onPage,
}: {
    current: number;
    last: number;
    onPage: (page: number) => void;
}) {
    if (last <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Halaman"
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
        >
            <Button
                type="button"
                variant="outline"
                disabled={current <= 1}
                onClick={() => onPage(current - 1)}
            >
                Sebelumnya
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
                {current} / {last}
            </span>
            <Button
                type="button"
                variant="outline"
                disabled={current >= last}
                onClick={() => onPage(current + 1)}
            >
                Berikutnya
            </Button>
        </nav>
    );
}

/** Jalur kemajuan bertahap; langkah yang sudah dicapai terisi penuh. */
export function StepTrack({
    steps,
    current,
    label,
}: {
    steps: string[];
    /** Indeks langkah saat ini; -1 bila proses berhenti sebelum langkah pertama. */
    current: number;
    label: string;
}) {
    return (
        <ol
            aria-label={label}
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
            {steps.map((step, index) => (
                <li
                    key={step}
                    aria-current={index === current ? 'step' : undefined}
                    className="flex min-w-0 flex-col gap-1.5"
                >
                    <span
                        aria-hidden
                        className={cn(
                            'h-1 rounded-full',
                            index <= current ? 'bg-primary' : 'bg-muted',
                        )}
                    />
                    <span
                        className={cn(
                            'truncate text-xs',
                            index <= current
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground',
                        )}
                    >
                        {step}
                    </span>
                </li>
            ))}
        </ol>
    );
}
