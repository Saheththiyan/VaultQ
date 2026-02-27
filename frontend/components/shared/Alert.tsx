'use client';

import { useEffect } from 'react';

interface AlertProps {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
}

export function Alert({ title, message, type = 'info', onClose }: AlertProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const colors = {
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        info: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    };

    const icons = {
        success: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors[type]} flex items-center justify-center`}>
                            {icons[type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
                            <p className="text-slate-400 text-sm">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 p-4">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ConfirmProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export function Confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', onConfirm, onCancel }: ConfirmProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    const iconColors = {
        danger: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        info: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    };

    const buttonColors = {
        danger: 'bg-red-600 hover:bg-red-500',
        warning: 'bg-amber-600 hover:bg-amber-500',
        info: 'bg-violet-600 hover:bg-violet-500',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconColors[type]} flex items-center justify-center`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
                            <p className="text-slate-400 text-sm">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 p-4 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl ${buttonColors[type]} text-white font-medium transition-all`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
