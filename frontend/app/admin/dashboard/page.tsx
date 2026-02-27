'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { Event } from '@/types';
import { Alert, Confirm } from '@/components/shared/Alert';

export default function AdminDashboard() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [qrModal, setQrModal] = useState<Event | null>(null);
    const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await api.get<Event[]>('/api/admin/events');
            setEvents(res.data);
        } catch {
            router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const createEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setCreating(true);
        setError('');
        try {
            const res = await api.post<Event>('/api/admin/events', { title: title.trim() });
            setEvents((prev) => [res.data, ...prev]);
            setTitle('');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            setError(e.response?.data?.error || 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    const deleteEvent = async (id: string) => {
        setConfirmDialog({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event and all its questions? This action cannot be undone.',
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    await api.delete(`/api/admin/events/${id}`);
                    setEvents((prev) => prev.filter((ev) => ev.id !== id));
                } catch {
                    setAlert({ title: 'Error', message: 'Failed to delete event. Please try again.', type: 'error' });
                }
            },
        });
    };

    const logout = async () => {
        await api.post('/api/admin/logout');
        router.push('/admin/login');
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const downloadQR = () => {
        if (!qrModal) return;
        
        // Get the SVG element
        const svg = document.querySelector('#qr-code-svg') as SVGElement;
        if (!svg) return;

        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size (add padding)
        const padding = 40;
        const qrSize = 200;
        canvas.width = qrSize + padding * 2;
        canvas.height = qrSize + padding * 2;

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Convert SVG to image
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            // Draw the QR code with padding
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                if (!blob) return;
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${qrModal.event_code}-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
            }, 'image/png');
            
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <img src="/logo.png" alt="VaultQ" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        <span className="font-semibold text-base sm:text-lg">VaultQ Admin</span>
                    </div>
                    <button onClick={logout} className="text-slate-400 hover:text-white text-xs sm:text-sm transition px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-800">
                        Sign out
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Create event */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Create New Event</h2>
                    <form onSubmit={createEvent} className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Event title (e.g. Annual Conf 2025)"
                            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm sm:text-base"
                        />
                        <button
                            type="submit"
                            disabled={creating || !title.trim()}
                            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-sm sm:text-base whitespace-nowrap"
                        >
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-xs sm:text-sm mt-2">{error}</p>}
                </div>

                {/* Event list */}
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Events</h2>
                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading events…</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                        No events yet. Create one above.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((ev) => (
                            <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/40 transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-violet-300 transition">{ev.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{new Date(ev.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ev.is_active ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                        {ev.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <code className="flex-1 text-sm bg-slate-800 text-violet-300 px-3 py-1.5 rounded-lg font-mono tracking-widest">
                                        {ev.event_code}
                                    </code>
                                    <button
                                        onClick={() => setQrModal(ev)}
                                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                        title="Show QR Code"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/event/${ev.id}`}
                                        className="flex-1 text-center text-sm py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 transition font-medium"
                                    >
                                        Moderate
                                    </Link>
                                    <Link
                                        href={`/display/${ev.event_code}`}
                                        target="_blank"
                                        className="text-sm px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                        title="Open display screen"
                                    >
                                        Display ↗
                                    </Link>
                                    <button
                                        onClick={() => deleteEvent(ev.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                                        title="Delete event"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* QR Modal */}
            {qrModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-semibold text-xl mb-1">{qrModal.title}</h3>
                        <p className="text-slate-400 text-sm mb-6">Scan to submit a question</p>
                        <div className="inline-block bg-white p-4 rounded-xl mb-4">
                            <QRCodeSVG id="qr-code-svg" value={`${origin}/e/${qrModal.event_code}`} size={200} />
                        </div>
                        <p className="text-violet-400 font-mono text-lg font-bold tracking-widest mb-4">{qrModal.event_code}</p>
                        <p className="text-slate-500 text-xs break-all mb-4">{origin}/e/{qrModal.event_code}</p>
                        <div className="flex gap-2">
                            <button onClick={downloadQR} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm transition font-medium flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button onClick={() => setQrModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm transition">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert */}
            {alert && <Alert title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

            {/* Confirm Dialog */}
            {confirmDialog && <Confirm title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />}
        </div>
    );
}
