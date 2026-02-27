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
        const onApproved = (q: Question) => { if (q.is_visible) setQuestions(prev => prev.find(x => x.id === q.id) ? prev.map(x => x.id === q.id ? q : x) : [...prev, q]); };

        socket.on('question:visible', onVisible);
        socket.on('question:hidden', onHidden);
        socket.on('question:removed', onRemoved);
        socket.on('question:approved', onApproved);

        return () => {
            socket.off('question:visible', onVisible);
            socket.off('question:hidden', onHidden);
            socket.off('question:removed', onRemoved);
            socket.off('question:approved', onApproved);
            disconnectSocket();
        };
    }, [fetchQuestions, eventCode]);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="VaultQ" className="w-6 h-6 object-contain" />
                    <span className="text-slate-400 text-sm font-mono">VaultQ</span>
                    <span className="text-slate-600 text-xs font-mono">{eventCode}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse2' : 'bg-red-500'}`} />
                    <span className="text-xs text-slate-500">{connected ? 'Live' : 'Reconnecting…'}</span>
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
                {loading ? (
                    <div className="text-slate-600 text-lg">Loading…</div>
                ) : questions.length === 0 ? (
                    <div className="text-center">
                        <div className="inline-block bg-white p-6 rounded-2xl mb-8 shadow-2xl">
                            <QRCodeSVG value={`${origin}/e/${eventCode}`} size={240} />
                        </div>
                        <p className="text-slate-400 text-3xl font-light mb-3">Scan to submit your questions</p>
                        <p className="text-slate-600 text-lg font-mono">{eventCode}</p>
                        <p className="text-slate-700 text-sm mt-4">or visit <span className="font-mono text-slate-600">{origin}/e/{eventCode}</span></p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl flex gap-8 items-start">
                        {/* Left: QR Code */}
                        <div className="flex-shrink-0 sticky top-8">
                            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                                <div className="bg-white p-4 rounded-xl mb-4">
                                    <QRCodeSVG value={`${origin}/e/${eventCode}`} size={280} />
                                </div>
                                <p className="text-slate-400 text-sm text-center mb-2">Scan to submit your question</p>
                                <p className="text-slate-600 text-xs font-mono text-center">{eventCode}</p>
                            </div>
                        </div>

                        {/* Right: Questions */}
                        <div className="flex-1 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                            {questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl px-8 py-6 backdrop-blur">
                                        <p className="text-white text-2xl sm:text-3xl font-light leading-relaxed">
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
            <div className="flex items-center justify-center gap-4 px-8 py-4 border-t border-slate-800/50">
                <p className="text-slate-700 text-sm">
                    Submit your question at <span className="text-slate-500 font-mono">/e/{eventCode}</span>
                </p>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <p className="text-slate-700 text-sm">{questions.length} question{questions.length !== 1 ? 's' : ''} shown</p>
            </div>
        </div>
    );
}
