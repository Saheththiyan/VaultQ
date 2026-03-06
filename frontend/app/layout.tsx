import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: 'VaultQ - Private Moderated Live Q&A Platform',
        template: '%s | VaultQ',
    },
    description:
        'VaultQ is a private, moderated live Q&A platform for events, webinars, and conferences. Submit questions anonymously, vote on the best ones, and let hosts keep the conversation focused.',
    keywords: [
        'VaultQ',
        'Q&A platform',
        'live Q&A',
        'moderated questions',
        'event Q&A',
        'audience engagement',
        'anonymous questions',
        'real-time voting',
        'webinar Q&A',
        'conference questions',
    ],
    authors: [{ name: 'VaultQ Team' }],
    creator: 'VaultQ',
    publisher: 'VaultQ',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        title: 'VaultQ - Private Moderated Live Q&A Platform',
        description:
            'Real-time Q&A platform for events and webinars. Engage your audience with professional moderated questions.',
        url: '/',
        siteName: 'VaultQ',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'VaultQ - Live Q&A Platform',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VaultQ - Private Moderated Live Q&A Platform',
        description: 'Real-time Q&A platform for events and webinars',
        images: ['/logo.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Add your verification tokens here when available
        // google: 'your-google-verification-token',
        // yandex: 'your-yandex-verification-token',
        // bing: 'your-bing-verification-token',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
