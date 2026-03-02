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
                title: event.title || `Event ${eventCode}`,
                description: `Join the Q&A session for ${event.title}. Submit your questions anonymously, vote on the best questions, and engage with the audience.`,
                openGraph: {
                    title: event.title || `Event ${eventCode}`,
                    description: `Live Q&A session for ${event.title}. Ask questions and vote on your favorites.`,
                    url: `${baseUrl}/e/${eventCode}`,
                    type: 'website',
                    images: ['/logo.png'],
                },
                twitter: {
                    card: 'summary_large_image',
                    title: event.title || `Event ${eventCode}`,
                    description: `Join the Q&A session for ${event.title}`,
                },
                robots: {
                    index: true,
                    follow: true,
                },
            };
        }
    } catch (error) {
        // Fallback if API is not available
        console.error('Error fetching event metadata:', error);
    }

    // Fallback metadata
    return {
        title: `Event ${eventCode}`,
        description: `Join this live Q&A session. Submit questions anonymously and vote on the best ones.`,
        openGraph: {
            title: `Event ${eventCode}`,
            description: 'Live Q&A session - Submit questions and vote',
            type: 'website',
        },
    };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
