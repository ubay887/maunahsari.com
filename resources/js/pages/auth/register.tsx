import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar alumni" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Field data-invalid={Boolean(errors.name)}>
                            <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Nama lengkap"
                            />
                            <InputError message={errors.name} />
                        </Field>

                        <Field data-invalid={Boolean(errors.email)}>
                            <FieldLabel htmlFor="email">
                                Alamat email
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="email@contoh.com"
                            />
                            <InputError message={errors.email} />
                        </Field>

                        <Field data-invalid={Boolean(errors.password)}>
                            <FieldLabel htmlFor="password">
                                Kata sandi
                            </FieldLabel>
                            <PasswordInput
                                id="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="Kata sandi"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </Field>

                        <Field
                            data-invalid={Boolean(errors.password_confirmation)}
                        >
                            <FieldLabel htmlFor="password_confirmation">
                                Konfirmasi kata sandi
                            </FieldLabel>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="Konfirmasi kata sandi"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            tabIndex={5}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            Daftar sebagai alumni
                        </Button>

                        <p className="text-center text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Masuk
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar alumni',
    description: 'Buat akun alumni. Persetujuan pengurus diperlukan.',
};
