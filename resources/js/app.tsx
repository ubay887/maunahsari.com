import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { shouldTransitionPage } from '@/lib/page-navigation';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import PublicLayout from '@/layouts/public-layout';
import AlumniLayout from '@/layouts/alumni-layout';
import ApplicantLayout from '@/layouts/applicant-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('alumni/'):
                return AlumniLayout;
            case name.startsWith('psb/portal/'):
                return ApplicantLayout;
            case name === 'welcome':
            case name === 'error':
            case name.startsWith('public/'):
            case name.startsWith('site/'):
            case name.startsWith('psb/'):
            case name.startsWith('articles/'):
            case name.startsWith('events/'):
                return PublicLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    defaults: {
        visitOptions: (href, options) => ({
            viewTransition:
                typeof window !== 'undefined' &&
                shouldTransitionPage(
                    href,
                    window.location.href,
                    options.method ?? 'get',
                    options.only ?? [],
                ),
        }),
    },
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
