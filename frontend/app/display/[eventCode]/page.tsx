'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Question } from '@/types';

export default function DisplayPage({ params }: { params: { eventCode: string } }) {
    const { eventCode } = params;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    const fetchQuestions = useCallback(async () => {
        try {
            const res = await api.get<Question[]>(`/api/events/${eventCode}/display`);
            setQuestions(res.data);
        } catch { /* ignored */ }
        finally { setLoading(false); }
    }, [eventCode]);

    useEffect(() => {
        fetchQuestions();
        const socket = connectSocket();

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.emit('join:display', eventCode);

        const onVisible = (q: Question) => {
            setQuestions(prev => {
                if (prev.find(x => x.id === q.id)) return prev.map(x => x.id === q.id ? q : x);
                return [...prev, q];
            });
        };
        const onHidden = (q: Question) => setQuestions(prev => prev.filter(x => x.id !== q.id));
        const onRemoved = ({ id }: { id: string }) => setQuestions(prev => prev.filter(x => x.id !== id));

        socket.on('question:visible', onVisible);
        socket.on('question:hidden', onHidden);
        socket.on('question:removed', onRemoved);

        return () => {
            socket.off('question:visible', onVisible);
            socket.off('question:hidden', onHidden);
            socket.off('question:removed', onRemoved);
            disconnectSocket();
        };
    }, [fetchQuestions, eventCode]);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-slate-800/50">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img src="/logo.png" alt="VaultQ" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    <span className="text-slate-400 text-xs sm:text-sm font-mono">VaultQ</span>
                    <span className="hidden sm:inline text-slate-600 text-xs font-mono">{eventCode}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse2' : 'bg-red-500'}`} />
                    <span className="text-xs text-slate-500">{connected ? 'Live' : 'Reconnecting…'}</span>
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 md:px-8 py-8 sm:py-12">
                {loading ? (
                    <div className="text-slate-600 text-base sm:text-lg">Loading…</div>
                ) : questions.length === 0 ? (
                    <div className="text-center max-w-sm w-full">
                        {/* QR code */}
                        <div className="inline-block bg-white p-4 sm:p-6 rounded-2xl mb-8 shadow-2xl">
                            <QRCodeSVG value={`${origin}/e/${eventCode}`} size={window.innerWidth < 640 ? 180 : 240} />
                        </div>

                        <p className="text-white text-xl sm:text-2xl font-bold mb-4">
                            Scan and submit your question
                        </p>

                        <p className="text-slate-400 text-base sm:text-lg font-semibold">
                            or enter{' '}
                            <span className="text-violet-400 font-bold font-mono">{eventCode}</span>
                            {' '}at{' '}
                            <span className="text-violet-400 font-bold font-mono">
                                {typeof window !== 'undefined' ? window.location.host : ''}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
                        {/* Left: QR Code */}
                        <div className="w-full md:w-auto flex-shrink-0 md:sticky md:top-8">
                            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 sm:p-6 backdrop-blur">
                                <div className="bg-white p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 mx-auto" style={{width: 'fit-content'}}>
                                    <QRCodeSVG value={`${origin}/e/${eventCode}`} size={window.innerWidth < 640 ? 160 : 280} />
                                </div>
                                <p className="text-white text-3xl font-bold text-center my-4">Scan to submit</p>
                                <p className="text-slate-400 text-lg text-center">
                                    or{' '}
                                    <span className="text-violet-400 font-bold font-mono">{eventCode}</span>
                                    {' '}at{' '}
                                    <span className="text-violet-400 font-bold font-mono break-all">
                                        {typeof window !== 'undefined' ? window.location.host : ''}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Right: Questions */}
                        <div className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] w-full">
                            {questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 backdrop-blur">
                                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-relaxed">
                                            {q.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-3 sm:px-8 py-3 sm:py-4 border-t border-slate-800/50">
                <p className="text-slate-300 text-xs sm:text-sm text-center font-semibold">
                    Join at{' '}
                    <span className="text-violet-400 font-bold font-mono">
                        {typeof window !== 'undefined' ? window.location.host : ''}
                    </span>
                    {' '}·{' '}
                    Code: <span className="text-white font-bold font-mono">{eventCode}</span>
                </p>
                {/* <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" /> */}
                {/* <p className="text-slate-700 text-xs sm:text-sm">{questions.length} question{questions.length !== 1 ? 's' : ''} shown</p> */}
            </div>
        </div>
    );
}
