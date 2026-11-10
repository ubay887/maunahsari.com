import { Form, Head } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi email" />
            {status === 'verification-link-sent' && (
                <Alert variant="success">
                    <AlertTitle>Tautan terkirim</AlertTitle>
                    <AlertDescription>
                        Periksa kotak masuk dan folder spam Anda.
                    </AlertDescription>
                </Alert>
            )}
            <Form {...send.form()} className="flex flex-col gap-4">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Kirim ulang email verifikasi
                        </Button>
                        <p className="text-center">
                            <TextLink href={logout()}>Keluar</TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi email',
    description:
        'Klik tautan yang dikirim ke email Anda sebelum melengkapi profil alumni.',
};
