import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your VaultQ events and Q&A sessions',
    robots: {
        index: false, // Don't index admin pages
        follow: false,
    },
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
