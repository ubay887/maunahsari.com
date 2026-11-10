import { Form } from '@inertiajs/react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            void fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold">Kode pemulihan 2FA</h3>
                <p className="text-xs text-muted-foreground">
                    Kode ini memulihkan akses jika perangkat 2FA hilang. Simpan
                    di pengelola kata sandi.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 select-none">
                <Button
                    type="button"
                    variant="outline"
                    onClick={toggleCodesVisibility}
                    aria-expanded={codesAreVisible}
                    aria-controls="recovery-codes-section"
                >
                    <RecoveryCodeIconComponent aria-hidden />
                    {codesAreVisible ? 'Sembunyikan' : 'Tampilkan'} kode
                </Button>

                {canRegenerateCodes && (
                    <Form
                        {...regenerateRecoveryCodes.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={fetchRecoveryCodes}
                    >
                        {({ processing }) => (
                            <Button
                                variant="outline"
                                type="submit"
                                disabled={processing}
                                aria-describedby="regenerate-warning"
                            >
                                <RefreshCw aria-hidden />
                                Buat ulang kode
                            </Button>
                        )}
                    </Form>
                )}
            </div>
            {codesAreVisible && (
                <div
                    id="recovery-codes-section"
                    className="flex flex-col gap-3"
                >
                    {errors?.length ? (
                        <AlertError errors={errors} />
                    ) : (
                        <>
                            <div
                                ref={codesSectionRef}
                                className="grid gap-1 rounded-lg bg-muted p-3 font-mono text-sm"
                                role="list"
                                aria-label="Kode pemulihan"
                            >
                                {recoveryCodesList.length ? (
                                    recoveryCodesList.map((code, index) => (
                                        <div
                                            key={index}
                                            role="listitem"
                                            className="select-text"
                                        >
                                            {code}
                                        </div>
                                    ))
                                ) : (
                                    <p
                                        role="status"
                                        className="text-sm text-muted-foreground"
                                    >
                                        Memuat kode pemulihan…
                                    </p>
                                )}
                            </div>

                            <p
                                id="regenerate-warning"
                                className="text-xs text-muted-foreground select-none"
                            >
                                Setiap kode hanya berlaku sekali dan dihapus
                                setelah dipakai. Butuh lebih banyak? Pilih{' '}
                                <span className="font-semibold">
                                    Buat ulang kode
                                </span>
                                .
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
