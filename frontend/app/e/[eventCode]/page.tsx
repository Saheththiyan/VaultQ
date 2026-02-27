'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Event } from '@/types';

const schema = z.object({
    content: z.string().min(5, 'Min 5 characters').max(500, 'Max 500 characters').trim(),
});
type FormData = z.infer<typeof schema>;

type PageState = 'loading' | 'not_found' | 'form' | 'success';

export default function ParticipantPage({ params }: { params: { eventCode: string } }) {
    const { eventCode } = params;
    const [pageState, setPageState] = useState<PageState>('loading');
    const [event, setEvent] = useState<Event | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    const content = watch('content', '');

    const submitAnother = () => {
        reset();
        setServerError('');
        setPageState('form');
    };

    useEffect(() => {
        api.get<Event>(`/api/events/${eventCode}`)
            .then(r => { setEvent(r.data); setPageState('form'); })
            .catch(() => setPageState('not_found'));
    }, [eventCode]);

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        setServerError('');
        try {
            await api.post(`/api/events/${eventCode}/questions`, { content: data.content });
            setPageState('success');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setServerError(e.response?.data?.error || 'Submission failed. Please try again.');
        } finally { setSubmitting(false); }
    };

    // Loading
    if (pageState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading event…
                </div>
            </div>
        );
    }

    // Not found
    if (pageState === 'not_found') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
                    <p className="text-slate-400">Check the event code and try again.</p>
                </div>
            </div>
        );
    }

    // Success
    if (pageState === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="text-center max-w-sm mx-auto animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Question Submitted!</h2>
                    <p className="text-slate-400 text-base leading-relaxed">
                        Your question has been received. The moderator will review it shortly.
                    </p>
                    <p className="text-slate-500 text-sm mt-4">Thank you for participating in <span className="text-violet-400">{event?.title}</span></p>
                    <button
                        onClick={submitAnother}
                        className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20"
                    >
                        Submit Another Question
                    </button>
                </div>
            </div>
        );
    }

    // Form
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Event header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-mono mb-3">
                        {eventCode}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{event?.title}</h1>
                    <p className="text-slate-400 text-sm mt-2">Ask a question anonymously</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl animate-slide-up">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {serverError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                                {serverError}
                            </div>
                        )}

                        <div>
                            <textarea
                                {...register('content')}
                                rows={5}
                                placeholder="Type your question here…"
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none text-sm"
                            />
                            <div className="flex items-start justify-between mt-1.5">
                                <div>
                                    {errors.content && <p className="text-red-400 text-xs">{errors.content.message}</p>}
                                </div>
                                <span className={`text-xs tabular-nums ${(content?.length || 0) > 450 ? 'text-amber-400' : 'text-slate-500'}`}>
                                    {content?.length || 0}/500
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting…
                                </span>
                            ) : 'Submit Question'}
                        </button>

                        <p className="text-center text-xs text-slate-600">
                            Your question is anonymous. Questions are reviewed before appearing publicly.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
