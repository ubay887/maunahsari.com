import { useId } from 'react';
import { cn } from '@/lib/utils';

type PatternVariant = 'star' | 'sparse-star' | 'geometric';

/**
 * Pola geometris Islami sebagai lapisan dekoratif. Warna mengikuti
 * `currentColor`, jadi atur lewat `text-*` dan `opacity-*` pada pemanggil.
 */
export function IslamicPattern({
    variant = 'star',
    className,
}: {
    variant?: PatternVariant;
    className?: string;
}) {
    const id = useId();
    const patternId = `${id}-pattern`;
    const motifId = `${id}-motif`;
    const tile = variant === 'sparse-star' ? 100 : 80;

    return (
        <svg
            aria-hidden
            className={cn('size-full', className)}
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                {variant === 'geometric' ? (
                    <>
                        <g id={motifId}>
                            <polygon
                                points="8.285,-20 20,-8.285 20,8.285 8.285,20 -8.285,20 -20,8.285 -20,-8.285 -8.285,-20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                            />
                            <rect
                                x="-6"
                                y="-6"
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.6"
                            />
                            <rect
                                x="-6"
                                y="-6"
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.6"
                                transform="rotate(45)"
                            />
                            <circle
                                r="2.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                            />
                        </g>
                        <pattern
                            id={patternId}
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <use href={`#${motifId}`} x="20" y="20" />
                            <use href={`#${motifId}`} x="0" y="0" />
                            <use href={`#${motifId}`} x="40" y="0" />
                            <use href={`#${motifId}`} x="0" y="40" />
                            <use href={`#${motifId}`} x="40" y="40" />
                        </pattern>
                    </>
                ) : (
                    <>
                        <g id={motifId}>
                            <rect
                                x="-12"
                                y="-12"
                                width="24"
                                height="24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                            />
                            <rect
                                x="-12"
                                y="-12"
                                width="24"
                                height="24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                                transform="rotate(45)"
                            />
                            <circle
                                r="8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.6"
                            />
                            <circle r="1.8" fill="currentColor" />
                        </g>
                        <pattern
                            id={patternId}
                            width={tile}
                            height={tile}
                            patternUnits="userSpaceOnUse"
                        >
                            <use href={`#${motifId}`} x="0" y="0" />
                            <use
                                href={`#${motifId}`}
                                x={tile / 2}
                                y={tile / 2}
                            />
                        </pattern>
                    </>
                )}
            </defs>
            <rect width="200" height="200" fill={`url(#${patternId})`} />
        </svg>
    );
}

/**
 * Hiasan sudut untuk kartu atau panel. Induknya perlu `relative`.
 */
export function OrnamentalCorner({
    position = 'top-left',
    className,
}: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    className?: string;
}) {
    const placement = {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0 rotate-90',
        'bottom-right': 'right-0 bottom-0 rotate-180',
        'bottom-left': 'bottom-0 left-0 -rotate-90',
    }[position];

    return (
        <svg
            aria-hidden
            className={cn(
                'pointer-events-none absolute size-10 text-gold/40',
                placement,
                className,
            )}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
        >
            <path d="M 2 48 L 2 12 C 2 6, 6 2, 12 2 L 48 2" strokeWidth="1.5" />
            <path
                d="M 8 48 L 8 20 C 8 14, 14 8, 20 8 L 48 8"
                strokeWidth="0.8"
                strokeDasharray="1 2"
            />
            <path
                d="M 2 2 C 8 8, 14 14, 16 16 C 14 18, 12 18, 10 16 Z"
                fill="currentColor"
                stroke="none"
            />
            <circle cx="24" cy="4" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="24" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
}

/**
 * Pemisah ornamental antar bagian halaman.
 */
export function SectionDivider({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn('flex items-center gap-4 text-gold', className)}
        >
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gold/50 to-transparent" />
            <svg className="h-8 w-40 shrink-0" viewBox="0 0 192 32" fill="none">
                <g
                    transform="translate(96, 16)"
                    stroke="currentColor"
                    strokeWidth="1.2"
                >
                    <rect x="-8" y="-8" width="16" height="16" />
                    <rect
                        x="-8"
                        y="-8"
                        width="16"
                        height="16"
                        transform="rotate(45)"
                    />
                    <circle r="4" fill="currentColor" />
                </g>
                <path
                    d="M80 16 C 70 16, 65 10, 55 10 C 45 10, 40 22, 30 22 C 20 22, 15 16, 0 16"
                    stroke="currentColor"
                />
                <path
                    d="M112 16 C 122 16, 127 10, 137 10 C 147 10, 152 22, 162 22 C 172 22, 177 16, 192 16"
                    stroke="currentColor"
                />
                <circle cx="30" cy="22" r="2" fill="currentColor" />
                <circle cx="162" cy="22" r="2" fill="currentColor" />
            </svg>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gold/50 to-transparent" />
        </div>
    );
}
