import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Alert, AlertDescription } from '@/components/reui/alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type DemoAccount = {
    key: string;
    label: string;
    description: string;
    email: string;
    password: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    canUsePasskeys?: boolean;
    demoAccounts?: DemoAccount[];
};

function DemoAccounts({ accounts }: { accounts: DemoAccount[] }) {
    const [loggingIn, setLoggingIn] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const signIn = (account: DemoAccount) => {
        setError(null);
        router.post(
            store.url(),
            { email: account.email, password: account.password },
            {
                onStart: () => setLoggingIn(account.key),
                onFinish: () => setLoggingIn(null),
                onError: (errors) =>
                    setError(
                        errors.email ??
                            'Akun demo belum tersedia. Jalankan seeder terlebih dahulu.',
                    ),
            },
        );
    };

    return (
        <section className="flex flex-col gap-3" aria-labelledby="demo-title">
            <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <h2
                    id="demo-title"
                    className="text-xs font-medium text-muted-foreground"
                >
                    Akun demo
                </h2>
                <Separator className="flex-1" />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <ul className="flex flex-col gap-2">
                {accounts.map((account) => (
                    <li
                        key={account.key}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium">
                                {account.label}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {account.description}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loggingIn !== null}
                            onClick={() => signIn(account)}
                            data-test={`demo-login-${account.key}`}
                        >
                            {loggingIn === account.key && <Spinner />}
                            Masuk
                        </Button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function Login({
    status,
    canResetPassword,
    canUsePasskeys = false,
    demoAccounts = [],
}: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <Alert variant="success">
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            {canUsePasskeys && <PasskeyVerify />}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Field data-invalid={Boolean(errors.email)}>
                            <FieldLabel htmlFor="email">
                                Alamat email
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@contoh.com"
                            />
                            <InputError message={errors.email} />
                        </Field>

                        <Field data-invalid={Boolean(errors.password)}>
                            <div className="flex items-center justify-between gap-2">
                                <FieldLabel htmlFor="password">
                                    Kata sandi
                                </FieldLabel>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs"
                                        tabIndex={5}
                                    >
                                        Lupa kata sandi?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Kata sandi"
                            />
                            <InputError message={errors.password} />
                        </Field>

                        <Field orientation="horizontal">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                            />
                            <FieldLabel htmlFor="remember">
                                Ingat saya
                            </FieldLabel>
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Masuk
                        </Button>

                        <p className="text-center text-muted-foreground">
                            Belum punya akun?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Daftar
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>

            {demoAccounts.length > 0 && (
                <DemoAccounts accounts={demoAccounts} />
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun Anda',
    description: 'Masukkan email dan kata sandi untuk melanjutkan',
};
