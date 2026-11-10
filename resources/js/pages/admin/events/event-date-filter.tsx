import { CalendarRange, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { eventDateFilterState, eventDateRangeLabel } from '@/lib/events';

export function EventDateFilter({
    from,
    to,
    disabled,
    onApply,
}: {
    from: string;
    to: string;
    disabled: boolean;
    onApply: (from: string, to: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo, setDateTo] = useState(to);
    const { invalid, canApply } = eventDateFilterState(
        dateFrom,
        dateTo,
        from,
        to,
        disabled,
    );

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setDateFrom(from);
                setDateTo(to);
                setOpen(nextOpen);
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="max-w-full min-w-0"
                    aria-label={`Filter tanggal mulai: ${eventDateRangeLabel(from, to)}`}
                >
                    <CalendarRange aria-hidden />
                    <span className="truncate">
                        {eventDateRangeLabel(from, to)}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-80 max-w-[calc(100vw-2rem)]"
            >
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!canApply) return;
                        onApply(dateFrom, dateTo);
                        setOpen(false);
                    }}
                >
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">
                            Tanggal mulai event
                        </p>
                        <FieldDescription id="event-date-description">
                            Batas tanggal termasuk dalam rentang, dalam WIB.
                            Kosongkan salah satu untuk rentang terbuka.
                        </FieldDescription>
                    </div>
                    <FieldGroup className="gap-4">
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor="event-date-from">
                                Dari
                            </FieldLabel>
                            <Input
                                id="event-date-from"
                                type="date"
                                value={dateFrom}
                                max={dateTo || undefined}
                                disabled={disabled}
                                aria-describedby="event-date-description"
                                onChange={(event) =>
                                    setDateFrom(event.target.value)
                                }
                            />
                        </Field>
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor="event-date-to">
                                Sampai
                            </FieldLabel>
                            <Input
                                id="event-date-to"
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                disabled={disabled}
                                aria-invalid={invalid}
                                aria-describedby={
                                    invalid
                                        ? 'event-date-error'
                                        : 'event-date-description'
                                }
                                onChange={(event) =>
                                    setDateTo(event.target.value)
                                }
                            />
                            {invalid && (
                                <FieldError id="event-date-error">
                                    Tanggal sampai harus sama atau setelah
                                    tanggal dari.
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>
                    <div className="flex items-center justify-end gap-2">
                        {(dateFrom || dateTo || from || to) && (
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={disabled}
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    if (from || to) onApply('', '');
                                    setOpen(false);
                                }}
                            >
                                <X aria-hidden />
                                Hapus tanggal
                            </Button>
                        )}
                        <Button type="submit" disabled={!canApply}>
                            Terapkan
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}
