'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/shared/Breadcrumb';

export default function JoinPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) {
            setError('Please enter an event code.');
            return;
        }
        if (trimmed.length < 3) {
            setError('Event codes are at least 3 characters.');
            return;
        }
        router.push(`/e/${trimmed}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">

            {/* breadcrumb */}
            <Breadcrumb
                className="absolute top-6 left-6"
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Join an Event' },
                ]}
            />

            <div className="w-full max-w-md animate-fade-in">

                {/* header */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <img src="/logo.png" alt="VaultQ" className="w-12 h-12 object-contain mx-auto mb-4" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Join an Event</h1>
                    <p className="text-slate-400 text-sm mt-1">Enter the code shared by your host</p>
                </div>

                {/* card */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                                Event Code
                            </label>

                            <div className="relative">
                                {/* icon */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                </div>

                                <input
                                    id="event-code"
                                    type="text"
                                    value={code}
                                    onChange={e => {
                                        setCode(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="e.g. ABC123"
                                    maxLength={20}
                                    autoComplete="off"
                                    autoFocus
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 text-base tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition uppercase"
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs flex items-center gap-1.5 mt-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            Go to Event
                        </button>
                    </form>
                </div>

                {/* organiser nudge */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Hosting an event?{' '}
                    <Link href="/admin/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
