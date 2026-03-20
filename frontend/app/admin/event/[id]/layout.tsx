import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Event Moderation',
    description: 'Moderate questions for your VaultQ event',
    robots: {
        index: false,
        follow: false,
    },
};

export default function EventModerationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
