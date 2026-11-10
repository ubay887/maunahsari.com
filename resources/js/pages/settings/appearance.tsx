import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { SettingsSection } from '@/components/settings-section';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Pengaturan tampilan" />

            <SettingsSection
                title="Tampilan"
                description="Pilih tema terang, gelap, atau ikuti sistem."
            >
                <AppearanceTabs />
            </SettingsSection>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan tampilan',
            href: editAppearance(),
        },
    ],
};
