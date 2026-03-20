import { Metadata } from 'next';

type Props = {
    params: { eventCode: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { eventCode } = params;

    try {
        // Try to fetch event data for better metadata
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/events/${eventCode}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (response.ok) {
            const event = await response.json();
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            return {
                title: `${event.title} - Display`,
                description: `Live Q&A display for ${event.title}. View questions submitted by the audience in real-time.`,
                openGraph: {
                    title: `${event.title} - Live Display`,
                    description: `Real-time Q&A display for ${event.title}`,
                    url: `${baseUrl}/display/${eventCode}`,
                    type: 'website',
                    images: ['/logo.png'],
                },
                twitter: {
                    card: 'summary_large_image',
                    title: `${event.title} - Live Display`,
                    description: `Real-time Q&A display for ${event.title}`,
                },
                robots: {
                    index: false, // Don't index display pages
                    follow: false,
                },
            };
        }
    } catch (error) {
        console.error('Error fetching event metadata:', error);
    }

    // Fallback metadata
    return {
        title: `Event Display - ${eventCode}`,
        description: 'Live Q&A display showing questions in real-time',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
