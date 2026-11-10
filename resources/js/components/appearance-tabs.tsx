import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
];

export default function AppearanceToggleTab() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <ToggleGroup
            type="single"
            variant="outline"
            value={appearance}
            onValueChange={(value) => {
                if (value) {
                    updateAppearance(value as Appearance);
                }
            }}
            aria-label="Tema"
            className="self-start"
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <ToggleGroupItem key={value} type="button" value={value}>
                    <Icon aria-hidden />
                    {label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
