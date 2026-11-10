import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

/**
 * Judul, deskripsi, canonical, Open Graph dan Twitter card untuk halaman
 * publik. `children` dipakai untuk tambahan seperti JSON-LD.
 */
export function SeoHead({
    title,
    description,
    canonical,
    children,
}: {
    title: string;
    description: string;
    canonical: string;
    children?: ReactNode;
}) {
    const { name, ogImage } = usePage<{ name: string; ogImage: string }>()
        .props;

    return (
        <Head title={title}>
            <meta
                head-key="description"
                name="description"
                content={description}
            />
            <link head-key="canonical" rel="canonical" href={canonical} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={description}
            />
            <meta head-key="og:type" property="og:type" content="website" />
            <meta head-key="og:url" property="og:url" content={canonical} />
            <meta
                head-key="og:site_name"
                property="og:site_name"
                content={name}
            />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary_large_image"
            />
            {children}
        </Head>
    );
}
