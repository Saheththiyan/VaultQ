import type { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/shared/StructuredData';

export const metadata: Metadata = {
    title: 'Home',
    description:
        'VaultQ is the professional moderated Q&A platform for events, webinars, and conferences. Engage your audience with real-time questions and voting.',
};

export default function HomePage() {
    return (
        <>
            <StructuredData
                type="WebApplication"
                data={{
                    name: 'VaultQ',
                    description:
                        'Professional moderated Q&A platform for events, webinars, and conferences',
                    applicationCategory: 'BusinessApplication',
                    operatingSystem: 'Web Browser',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                }}
            />
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Section */}
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to VaultQ
                    </h1>
                    <p className="text-xl text-gray-700 mb-8">
                        The professional moderated Q&A platform for your events, webinars, and conferences
                    </p>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                Real-Time Engagement
                            </h2>
                            <p className="text-gray-600">
                                Collect questions from your audience in real-time and moderate them efficiently
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                Upvoting System
                            </h2>
                            <p className="text-gray-600">
                                Let your audience vote on the most important questions
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                Private & Secure
                            </h2>
                            <p className="text-gray-600">
                                Keep your Q&A sessions private with secure event codes
                            </p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/admin/login"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Admin Login
                        </Link>
                        <Link
                            href="/admin/signup"
                            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Description */}
                    <div className="mt-16 text-left bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            How VaultQ Works
                        </h2>
                        <ol className="space-y-4 text-gray-700">
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-3">1.</span>
                                <span>Create an event and get a unique event code</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-3">2.</span>
                                <span>Share the event code with your participants</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-3">3.</span>
                                <span>Participants submit questions anonymously</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-3">4.</span>
                                <span>Questions are upvoted by the audience</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-3">5.</span>
                                <span>Moderate and answer the top questions in real-time</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}
