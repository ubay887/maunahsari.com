import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { SettingsSection } from '@/components/settings-section';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { edit } from '@/routes/security';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} & ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Pengaturan keamanan" />

            <SettingsSection
                title="Ubah kata sandi"
                description="Gunakan kata sandi yang panjang dan acak agar akun tetap aman."
            >
                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="flex flex-col gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                data-invalid={Boolean(errors.current_password)}
                            >
                                <FieldLabel htmlFor="current_password">
                                    Kata sandi saat ini
                                </FieldLabel>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    autoComplete="current-password"
                                    placeholder="Kata sandi saat ini"
                                />
                                <InputError message={errors.current_password} />
                            </Field>

                            <Field data-invalid={Boolean(errors.password)}>
                                <FieldLabel htmlFor="password">
                                    Kata sandi baru
                                </FieldLabel>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Kata sandi baru"
                                    passwordrules={props.passwordRules}
                                />
                                <InputError message={errors.password} />
                            </Field>

                            <Field
                                data-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                            >
                                <FieldLabel htmlFor="password_confirmation">
                                    Konfirmasi kata sandi
                                </FieldLabel>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Konfirmasi kata sandi"
                                    passwordrules={props.passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </Field>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    {processing && <Spinner />}
                                    Simpan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan keamanan',
            href: edit(),
        },
    ],
};
