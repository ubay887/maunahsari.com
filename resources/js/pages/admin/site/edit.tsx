import { ExternalLink } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import type {
    ContactContent,
    PondokContent,
    ProfileContent,
    SitePageKey,
} from '@/types/site';
import ContactForm from './contact-form';
import PondokForm from './pondok-form';
import ProfileForm from './profile-form';

type Page = {
    key: SitePageKey;
    label: string;
    description: string;
    public_url: string;
};

export default function Edit({
    page,
    content,
}: {
    page: Page;
    content: ProfileContent | PondokContent | ContactContent;
}) {
    return (
        <AdminPage
            title={`Ubah ${page.label.toLowerCase()}`}
            description={page.description}
            actions={
                <Button type="button" variant="outline" asChild>
                    <a
                        href={page.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink data-icon="inline-start" aria-hidden />
                        Lihat halaman
                    </a>
                </Button>
            }
        >
            {page.key === 'profile' && (
                <ProfileForm content={content as ProfileContent} />
            )}
            {(page.key === 'pondok-putra' || page.key === 'pondok-putri') && (
                <PondokForm
                    key={page.key}
                    pageKey={page.key}
                    content={content as PondokContent}
                />
            )}
            {page.key === 'contact' && (
                <ContactForm content={content as ContactContent} />
            )}
        </AdminPage>
    );
}
