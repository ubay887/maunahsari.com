import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/reui/alert';
import { SettingsSection } from '@/components/settings-section';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Pengaturan profil" />

            <SettingsSection
                title="Profil"
                description="Perbarui nama dan alamat email Anda."
            >
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <Field data-invalid={Boolean(errors.name)}>
                                <FieldLabel htmlFor="name">Nama</FieldLabel>
                                <Input
                                    id="name"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
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
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="email@contoh.com"
                                />
                                <InputError message={errors.email} />
                            </Field>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <Alert variant="warning">
                                        <AlertDescription>
                                            Email Anda belum diverifikasi.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="underline underline-offset-4"
                                            >
                                                Kirim ulang email verifikasi.
                                            </Link>
                                        </AlertDescription>
                                    </Alert>
                                )}

                            {status === 'verification-link-sent' && (
                                <Alert variant="success">
                                    <AlertDescription>
                                        Tautan verifikasi baru telah dikirim ke
                                        email Anda.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {processing && <Spinner />}
                                    Simpan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan profil',
            href: edit(),
        },
    ],
};
