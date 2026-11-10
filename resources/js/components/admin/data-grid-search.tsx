import { Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';

/**
 * The one search box for table toolbars: search icon, clear button and an
 * explicit submit, so every list searches the same way.
 */
export function DataGridSearch({
    label,
    placeholder,
    value,
    onChange,
    onSubmit,
    onClear,
    disabled = false,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    disabled?: boolean;
}) {
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit();
    }

    return (
        <form role="search" onSubmit={submit} className="w-full sm:w-72">
            <InputGroup>
                <InputGroupAddon>
                    <Search aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                    aria-label={label}
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                />
                <InputGroupAddon align="inline-end">
                    {value !== '' && (
                        <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label="Bersihkan pencarian"
                            disabled={disabled}
                            onClick={onClear}
                        >
                            <X aria-hidden />
                        </InputGroupButton>
                    )}
                    <InputGroupButton
                        type="submit"
                        size="xs"
                        disabled={disabled}
                    >
                        Cari
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </form>
    );
}
