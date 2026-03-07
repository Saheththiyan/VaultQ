import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to VaultQ to manage your events and moderate live Q&A sessions.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
