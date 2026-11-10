import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';

export default function PasswordInput({
    className,
    ref,
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & { ref?: Ref<HTMLInputElement> }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                className={className}
                ref={ref}
                {...props}
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    type="button"
                    size="icon-xs"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                        showPassword
                            ? 'Sembunyikan kata sandi'
                            : 'Tampilkan kata sandi'
                    }
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff aria-hidden />
                    ) : (
                        <Eye aria-hidden />
                    )}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}
