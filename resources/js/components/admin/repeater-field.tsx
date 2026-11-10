import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

function move<T>(items: T[], from: number, to: number): T[] {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);

    return next;
}

/**
 * Daftar isian yang bisa ditambah, dihapus, dan diurutkan ulang. `renderItem`
 * menerima fungsi `update` untuk mengganti item pada posisinya.
 */
export function RepeaterField<T>({
    label,
    description,
    items,
    onChange,
    createItem,
    renderItem,
    addLabel,
    itemLabel,
    min = 0,
    max = 20,
    error,
}: {
    label: string;
    description?: string;
    items: T[];
    onChange: (items: T[]) => void;
    createItem: () => T;
    renderItem: (
        item: T,
        index: number,
        update: (item: T) => void,
    ) => ReactNode;
    addLabel: string;
    itemLabel: string;
    min?: number;
    max?: number;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Belum ada {itemLabel.toLowerCase()}.
                </p>
            )}
            <ol className="flex flex-col gap-4">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {itemLabel} {index + 1}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Naikkan ${itemLabel.toLowerCase()} ${index + 1}`}
                                    disabled={index === 0}
                                    onClick={() =>
                                        onChange(move(items, index, index - 1))
                                    }
                                >
                                    <ArrowUp aria-hidden />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Turunkan ${itemLabel.toLowerCase()} ${index + 1}`}
                                    disabled={index === items.length - 1}
                                    onClick={() =>
                                        onChange(move(items, index, index + 1))
                                    }
                                >
                                    <ArrowDown aria-hidden />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Hapus ${itemLabel.toLowerCase()} ${index + 1}`}
                                    disabled={items.length <= min}
                                    onClick={() =>
                                        onChange(
                                            items.filter(
                                                (_, position) =>
                                                    position !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 aria-hidden />
                                </Button>
                            </div>
                        </div>
                        {renderItem(item, index, (next) =>
                            onChange(
                                items.map((current, position) =>
                                    position === index ? next : current,
                                ),
                            ),
                        )}
                    </li>
                ))}
            </ol>
            <InputError message={error} />
            <div>
                <Button
                    type="button"
                    variant="outline"
                    disabled={items.length >= max}
                    onClick={() => onChange([...items, createItem()])}
                >
                    <Plus data-icon="inline-start" aria-hidden />
                    {addLabel}
                </Button>
            </div>
        </div>
    );
}
