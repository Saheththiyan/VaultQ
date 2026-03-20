'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Question, Event } from '@/types';
import { Alert, Confirm } from '@/components/shared/Alert';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ANSWERED';

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-500/15 text-amber-400',
    APPROVED: 'bg-green-500/15 text-green-400',
    REJECTED: 'bg-red-500/15 text-red-400',
    ANSWERED: 'bg-blue-500/15 text-blue-400',
};

export default function EventModerationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [event, setEvent] = useState<Event | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [tab, setTab] = useState<Tab>('PENDING');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [evRes, qRes] = await Promise.all([
                api.get<Event[]>(`/api/admin/events`).then(r => ({ data: r.data.find(e => e.id === id) })),
                api.get<Question[]>(`/api/admin/events/${id}/questions`),
            ]);
            setEvent(evRes.data || null);
            setQuestions(qRes.data);
        } catch { router.push('/admin/login'); }
        finally { setLoading(false); }
    }, [id, router]);

    useEffect(() => {
        fetchData();
        const socket = connectSocket();
        socket.emit('join:admin', id);
        const onNew = (q: Question) => setQuestions(prev => [q, ...prev]);
        const onUpdated = (q: Question) => setQuestions(prev => prev.map(x => x.id === q.id ? q : x));
        const onDeleted = ({ id: qid }: { id: string }) => setQuestions(prev => prev.filter(x => x.id !== qid));
        socket.on('question:new', onNew);
        socket.on('question:updated', onUpdated);
        socket.on('question:deleted', onDeleted);
        return () => { socket.off('question:new', onNew); socket.off('question:updated', onUpdated); socket.off('question:deleted', onDeleted); disconnectSocket(); };
    }, [fetchData, id]);

    const action = async (endpoint: string, qid: string) => {
        setActionLoading(qid + endpoint);
        try {
            const res = await api.patch<Question>(`/api/admin/questions/${qid}/${endpoint}`);
            setQuestions(prev => prev.map(q => q.id === qid ? res.data : q));
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setAlert({ title: 'Action Failed', message: e.response?.data?.error || 'Failed to perform action. Please try again.', type: 'error' });
        } finally { setActionLoading(null); }
    };

    const del = async (qid: string) => {
        setConfirmDialog({
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question? This action cannot be undone.',
            onConfirm: async () => {
                setConfirmDialog(null);
                setActionLoading(qid + 'delete');
                try {
                    await api.delete(`/api/admin/questions/${qid}`);
                    setQuestions(prev => prev.filter(q => q.id !== qid));
                } catch {
                    setAlert({ title: 'Error', message: 'Failed to delete question. Please try again.', type: 'error' });
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const filtered = questions
        .filter(q => q.status === tab)
        .filter(q => !search || q.content.toLowerCase().includes(search.toLowerCase()));

    const counts: Record<Tab, number> = {
        PENDING: questions.filter(q => q.status === 'PENDING').length,
        APPROVED: questions.filter(q => q.status === 'APPROVED').length,
        REJECTED: questions.filter(q => q.status === 'REJECTED').length,
        ANSWERED: questions.filter(q => q.status === 'ANSWERED').length,
    };

    const startEdit = (q: Question) => { setEditingId(q.id); setEditDraft(q.content); };
    const cancelEdit = () => { setEditingId(null); setEditDraft(''); };
    const saveEdit = async (qid: string) => {
        const trimmed = editDraft.trim();
        if (trimmed.length < 5) { setAlert({ title: 'Too short', message: 'Question must be at least 5 characters.', type: 'warning' }); return; }
        setActionLoading(qid + 'edit');
        try {
            const res = await api.patch<Question>(`/api/admin/questions/${qid}/edit`, { content: trimmed });
            setQuestions(prev => prev.map(q => q.id === qid ? res.data : q));
            cancelEdit();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setAlert({ title: 'Edit Failed', message: e.response?.data?.error || 'Failed to save edit.', type: 'error' });
        } finally { setActionLoading(null); }
    };

    const logout = async () => { await api.post('/api/admin/logout'); router.push('/admin/login'); };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
                    <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm sm:text-base font-semibold truncate">{event?.title || 'Loading…'}</h1>
                        {event && <p className="text-xs text-slate-500 font-mono">{event.event_code}</p>}
                    </div>
                    {event && (
                        <Link href={`/display/${event.event_code}`} target="_blank"
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition whitespace-nowrap">
                            Display ↗
                        </Link>
                    )}
                    <button onClick={logout} className="hidden sm:block text-slate-400 hover:text-white text-sm transition px-3 py-1.5 rounded-lg hover:bg-slate-800">Sign Out</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {/* Tabs + search */}
                <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                    <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 min-w-max">
                            {(['PENDING', 'APPROVED', 'REJECTED', 'ANSWERED'] as Tab[]).map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${tab === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    {t.charAt(0) + t.slice(1).toLowerCase()}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-slate-800'}`}>{counts[t]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search questions…"
                        className="w-full px-4 py-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading…</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                        No {tab.toLowerCase()} questions{search ? ' matching your search' : ''}.
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {filtered.map(q => (
                            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 hover:border-slate-700 transition group">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        {editingId === q.id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    value={editDraft}
                                                    onChange={e => setEditDraft(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-violet-500 text-white text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => saveEdit(q.id)}
                                                        disabled={!!actionLoading}
                                                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition disabled:opacity-50">
                                                        {actionLoading === q.id + 'edit' ? '…' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        disabled={!!actionLoading}
                                                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition disabled:opacity-50">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2 group/content">
                                                <p className="text-white text-sm sm:text-base leading-relaxed flex-1">{q.content}</p>
                                                {(q.status === 'PENDING' || q.status === 'APPROVED') && (
                                                    <button
                                                        onClick={() => startEdit(q)}
                                                        disabled={!!actionLoading}
                                                        title="Edit question"
                                                        className="flex-shrink-0 p-1 rounded text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition opacity-0 group-hover:opacity-100 disabled:opacity-0">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                                            <span className="text-xs text-slate-600">{new Date(q.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap">
                                        {q.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => action('approve', q.id)} disabled={!!actionLoading}
                                                    className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                    {actionLoading === q.id + 'approve' ? '…' : 'Approve'}
                                                </button>
                                                <button onClick={() => action('reject', q.id)} disabled={!!actionLoading}
                                                    className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                    {actionLoading === q.id + 'reject' ? '…' : 'Reject'}
                                                </button>
                                            </>
                                        )}
                                        {q.status === 'APPROVED' && (
                                            <>
                                                <button onClick={() => action('pin', q.id)} disabled={!!actionLoading}
                                                    className={`px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0 ${
                                                        q.is_pinned
                                                            ? 'bg-violet-500/25 text-violet-300 hover:bg-violet-500/15'
                                                            : 'bg-slate-700/50 text-slate-400 hover:bg-violet-500/15 hover:text-violet-400'
                                                    }`}>
                                                    {actionLoading === q.id + 'pin' ? '…' : q.is_pinned ? '★ Pinned' : '☆ Pin'}
                                                </button>
                                                <button onClick={() => action('mark-answered', q.id)} disabled={!!actionLoading}
                                                    className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                    {actionLoading === q.id + 'mark-answered' ? '…' : 'Answered'}
                                                </button>
                                                <button onClick={() => action('reject', q.id)} disabled={!!actionLoading}
                                                    className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                    {actionLoading === q.id + 'reject' ? '…' : 'Reject'}
                                                </button>
                                            </>
                                        )}
                                        {q.status === 'REJECTED' && (
                                            <button onClick={() => action('approve', q.id)} disabled={!!actionLoading}
                                                className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 font-medium transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                {actionLoading === q.id + 'approve' ? '…' : 'Re-approve'}
                                            </button>
                                        )}
                                        {q.status !== 'ANSWERED' && (
                                            <button onClick={() => del(q.id)} disabled={!!actionLoading}
                                                className="p-2 sm:p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
                                                <svg className="w-5 h-5 sm:w-4 sm:h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                        {q.status === 'ANSWERED' && (
                                            <button onClick={() => del(q.id)} disabled={!!actionLoading}
                                                className="px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 min-h-[44px] sm:min-h-0">
                                                {actionLoading === q.id + 'delete' ? '…' : 'Delete'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Alert */}
            {alert && <Alert title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

            {/* Confirm Dialog */}
            {confirmDialog && <Confirm title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />}
        </div>
    );
}
