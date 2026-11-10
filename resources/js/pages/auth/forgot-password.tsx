import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/reui/alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa kata sandi" />

            {status && (
                <Alert variant="success">
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <Form {...email.form()} className="flex flex-col gap-4">
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
                                autoComplete="off"
                                autoFocus
                                placeholder="email@contoh.com"
                            />
                            <InputError message={errors.email} />
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && <Spinner />}
                            Kirim tautan atur ulang
                        </Button>
                    </>
                )}
            </Form>

            <p className="text-center text-muted-foreground">
                Atau kembali ke{' '}
                <TextLink href={login()}>halaman masuk</TextLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa kata sandi',
    description: 'Masukkan email untuk menerima tautan atur ulang kata sandi',
};
