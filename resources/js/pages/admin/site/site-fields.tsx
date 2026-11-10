import InputError from '@/components/input-error';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { store as uploadImage } from '@/routes/admin/articles/images';

export function TextField({
    id,
    label,
    value,
    onChange,
    error,
    maxLength = 255,
    hint,
    type = 'text',
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    maxLength?: number;
    hint?: string;
    type?: 'text' | 'url' | 'tel';
}) {
    return (
        <Field className="w-auto">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
                id={id}
                type={type}
                maxLength={maxLength}
                value={value}
                aria-invalid={Boolean(error)}
                onChange={(event) => onChange(event.target.value)}
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </Field>
    );
}

export function TextAreaField({
    id,
    label,
    value,
    onChange,
    error,
    maxLength = 1000,
    rows = 3,
    hint,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    maxLength?: number;
    rows?: number;
    hint?: string;
}) {
    return (
        <Field className="w-auto">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Textarea
                id={id}
                rows={rows}
                maxLength={maxLength}
                value={value}
                aria-invalid={Boolean(error)}
                onChange={(event) => onChange(event.target.value)}
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </Field>
    );
}

export function RichField({
    label,
    value,
    onChange,
    error,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (html: string) => void;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <Field className="w-auto">
            <FieldLabel>{label}</FieldLabel>
            <RichTextEditor
                label={label}
                value={value}
                onChange={onChange}
                uploadUrl={uploadImage.url()}
                disabled={disabled}
            />
            <InputError message={error} />
        </Field>
    );
}
