import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login to VaultQ admin dashboard to manage your events and Q&A sessions',
    robots: {
        index: false, // Don't index admin pages
        follow: false,
    },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
