import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-h-0 min-w-0 overflow-hidden"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div
                    id="page-content"
                    scroll-region=""
                    tabIndex={0}
                    role="region"
                    aria-label="Konten halaman"
                    className="admin-page-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto text-sm"
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
