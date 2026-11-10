import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';
import { SettingsSection } from '@/components/settings-section';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <SettingsSection
            title="Hapus akun"
            description="Hapus akun beserta seluruh datanya."
        >
            <Alert variant="destructive">
                <AlertTitle>Peringatan</AlertTitle>
                <AlertDescription>
                    Tindakan ini tidak dapat dibatalkan.
                </AlertDescription>
            </Alert>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="destructive"
                        className="self-start"
                        data-test="delete-user-button"
                    >
                        Hapus akun
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus akun Anda?</DialogTitle>
                        <DialogDescription>
                            Setelah dihapus, seluruh data akun akan hilang
                            permanen. Masukkan kata sandi untuk mengonfirmasi.
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                        className="flex flex-col gap-4"
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <Field data-invalid={Boolean(errors.password)}>
                                    <FieldLabel
                                        htmlFor="password"
                                        className="sr-only"
                                    >
                                        Kata sandi
                                    </FieldLabel>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        ref={passwordInput}
                                        placeholder="Kata sandi"
                                        autoComplete="current-password"
                                    />
                                    <InputError message={errors.password} />
                                </Field>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                resetAndClearErrors()
                                            }
                                        >
                                            Batal
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                        data-test="confirm-delete-user-button"
                                    >
                                        {processing && <Spinner />}
                                        Hapus akun
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </SettingsSection>
    );
}
