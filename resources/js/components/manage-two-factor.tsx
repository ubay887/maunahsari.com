import { Form } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SettingsSection } from '@/components/settings-section';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <SettingsSection
            title="Autentikasi dua faktor"
            description="Tambahkan lapisan keamanan saat masuk."
        >
            {twoFactorEnabled ? (
                <>
                    <p className="text-muted-foreground">
                        Saat masuk Anda akan diminta kode acak dari aplikasi
                        autentikator (TOTP) di ponsel.
                    </p>

                    <Form {...disable.form()} className="self-start">
                        {({ processing }) => (
                            <Button
                                variant="destructive"
                                type="submit"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Nonaktifkan 2FA
                            </Button>
                        )}
                    </Form>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </>
            ) : (
                <>
                    <p className="text-muted-foreground">
                        Setelah diaktifkan, Anda akan diminta kode acak saat
                        masuk. Kode diambil dari aplikasi autentikator (TOTP) di
                        ponsel.
                    </p>

                    {hasSetupData ? (
                        <Button
                            type="button"
                            className="self-start"
                            onClick={() => setShowSetupModal(true)}
                        >
                            <ShieldCheck aria-hidden />
                            Lanjutkan pengaturan
                        </Button>
                    ) : (
                        <Form
                            {...enable.form()}
                            onSuccess={() => setShowSetupModal(true)}
                            className="self-start"
                        >
                            {({ processing }) => (
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Aktifkan 2FA
                                </Button>
                            )}
                        </Form>
                    )}
                </>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </SettingsSection>
    );
}
