import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Signup',
    description: 'Create a VaultQ admin account to start managing events and Q&A sessions',
    robots: {
        index: false, // Don't index admin pages
        follow: false,
    },
};

export default function AdminSignupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
