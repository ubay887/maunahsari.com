import type { ReactNode } from 'react';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/reui/frame';

/**
 * One focused group of settings: a Frame with title, one-line description
 * and a single panel for the form or controls.
 */
export function SettingsSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <Frame spacing="default">
            <FrameHeader className="flex flex-col gap-0.5">
                <FrameTitle>{title}</FrameTitle>
                {description && (
                    <FrameDescription>{description}</FrameDescription>
                )}
            </FrameHeader>
            <FramePanel className="flex flex-col gap-4">{children}</FramePanel>
        </Frame>
    );
}
