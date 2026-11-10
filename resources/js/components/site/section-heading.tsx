import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Judul bagian khas pesantren: eyebrow emas, judul serif, garis emas.
 * `tone="inverse"` dipakai di atas pita hijau.
 */
export function SectionHeading({
    eyebrow,
    title,
    description,
    as: Heading = 'h2',
    align = 'center',
    tone = 'default',
    className,
}: {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    as?: 'h1' | 'h2' | 'h3';
    align?: 'center' | 'start';
    tone?: 'default' | 'inverse';
    className?: string;
}) {
    const inverse = tone === 'inverse';

    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                align === 'center' ? 'items-center text-center' : 'items-start',
                className,
            )}
        >
            <span
                className={cn(
                    'text-xs font-semibold tracking-widest uppercase',
                    inverse ? 'text-gold' : 'text-gold-foreground',
                )}
            >
                {eyebrow}
            </span>
            <Heading
                className={cn(
                    'font-display text-3xl font-bold tracking-tight text-balance md:text-4xl',
                    inverse ? 'text-white' : 'text-primary',
                )}
            >
                {title}
            </Heading>
            <div aria-hidden className="h-1 w-16 rounded-full bg-gold" />
            {description && (
                <p
                    className={cn(
                        'max-w-2xl text-sm text-pretty',
                        inverse ? 'text-white/75' : 'text-muted-foreground',
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    );
}
