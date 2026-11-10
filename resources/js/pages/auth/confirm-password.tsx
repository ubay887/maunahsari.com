import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi kata sandi" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Field data-invalid={Boolean(errors.password)}>
                            <FieldLabel htmlFor="password">
                                Kata sandi
                            </FieldLabel>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Kata sandi"
                                autoComplete="current-password"
                                autoFocus
                            />
                            <InputError message={errors.password} />
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Konfirmasi kata sandi
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi kata sandi',
    description:
        'Area ini aman. Konfirmasi kata sandi Anda sebelum melanjutkan.',
};
