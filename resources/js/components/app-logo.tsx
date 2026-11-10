import { usePage } from '@inertiajs/react';
import { images } from '@/lib/site';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <img
                src={images.seal}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full border border-border bg-white object-contain p-0.5"
            />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate font-display leading-tight font-bold">
                    {name}
                </span>
            </div>
        </>
    );
}
