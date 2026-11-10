import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Slider kiri-kanan berbasis CSS scroll-snap. Tombol panah menggeser satu
 * layar; geser dengan jari/trackpad dan tombol panah keyboard tetap berfungsi.
 * Tiap anak jadi satu slide (lebar diatur oleh `slideClassName`).
 */
export function ScrollSlider({
    label,
    slideClassName = 'w-72 sm:w-80',
    children,
}: {
    label: string;
    slideClassName?: string;
    children: ReactNode[];
}) {
    const scroller = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ start: true, end: true });

    const update = useCallback(() => {
        const el = scroller.current;

        if (!el) {
            return;
        }

        setEdges({
            start: el.scrollLeft <= 1,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
        });
    }, []);

    useEffect(() => {
        update();
        const el = scroller.current;
        const observer = new ResizeObserver(update);

        if (el) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, [update, children.length]);

    const scrollByPage = (direction: 1 | -1) => {
        const el = scroller.current;

        if (!el) {
            return;
        }

        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        el.scrollBy({
            left: direction * el.clientWidth * 0.8,
            behavior: reduce ? 'auto' : 'smooth',
        });
    };

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            className="relative"
        >
            <ul
                ref={scroller}
                onScroll={update}
                tabIndex={0}
                className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
                {children.map((child, index) => (
                    <li
                        key={index}
                        aria-roledescription="slide"
                        className={`flex shrink-0 snap-start ${slideClassName}`}
                    >
                        <div className="h-full w-full">{child}</div>
                    </li>
                ))}
            </ul>
            {!(edges.start && edges.end) && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        aria-label="Sebelumnya"
                        disabled={edges.start}
                        onClick={() => scrollByPage(-1)}
                        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full max-sm:hidden sm:-left-4"
                    >
                        <ChevronLeft aria-hidden />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        aria-label="Berikutnya"
                        disabled={edges.end}
                        onClick={() => scrollByPage(1)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full max-sm:hidden sm:-right-4"
                    >
                        <ChevronRight aria-hidden />
                    </Button>
                </>
            )}
        </div>
    );
}
