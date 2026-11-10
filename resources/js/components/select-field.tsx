import { useId } from 'react';
import InputError from '@/components/input-error';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type SelectOption = { value: string; label: string };

export function SelectField({
    id,
    label,
    value,
    onChange,
    options,
    error,
    placeholder = 'Pilih…',
    disabled = false,
}: {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
        <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={fieldId}
                    className="w-full"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError id={`${fieldId}-error`} message={error} />
        </Field>
    );
}
