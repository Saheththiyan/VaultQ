'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/* ── tiny animated orb canvas ─────────────────────────────────────────── */
function OrbCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let raf: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const orbs = Array.from({ length: 6 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 120 + Math.random() * 180,
            dx: (Math.random() - 0.5) * 0.35,
            dy: (Math.random() - 0.5) * 0.35,
            hue: i % 2 === 0 ? 263 : 220,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            orbs.forEach(o => {
                const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
                grd.addColorStop(0, `hsla(${o.hue}, 70%, 55%, 0.18)`);
                grd.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
                o.x += o.dx;
                o.y += o.dy;
                if (o.x < -o.r) o.x = canvas.width + o.r;
                if (o.x > canvas.width + o.r) o.x = -o.r;
                if (o.y < -o.r) o.y = canvas.height + o.r;
                if (o.y > canvas.height + o.r) o.y = -o.r;
            });
            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden
        />
    );
}

/* ── feature card ──────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-start gap-3 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur hover:border-violet-500/40 hover:bg-slate-800/60 transition-all duration-300 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/25 transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-white font-semibold text-base">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

/* ── page ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 text-white overflow-hidden">

            {/* ── nav ── */}
            <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="VaultQ" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold tracking-tight">VaultQ</span>
                </div>
                <Link
                    href="/admin/login"
                    className="text-sm text-slate-300 hover:text-white font-medium transition-colors"
                >
                    Sign In
                </Link>
            </nav>

            {/* ── hero ── */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 max-w-4xl mx-auto">
                <OrbCanvas />

                <div className="relative z-10 animate-fade-in">
                    {/* pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium mb-8 tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Live Q&amp;A · Anonymous · Moderated
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                        The smarter way to{' '}
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            run Q&amp;A
                        </span>
                    </h1>

                    <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
                        Let your audience ask questions anonymously. You review and surface the best ones — no noise, no chaos.
                    </p>

                    {/* primary CTA */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                        <Link
                            href="/join"
                            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            Join an Event
                        </Link>

                        <Link
                            href="/admin/login"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── features ── */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        }
                        title="Fully Anonymous"
                        desc="Participants ask freely without revealing who they are — honest questions, real conversations."
                    />
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title="Moderated Queue"
                        desc="You decide what gets seen. Approve, reject, or pin questions before they go live."
                    />
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        }
                        title="Just a Code Away"
                        desc="Share one short event code. No app download, no sign-up required for your audience."
                    />
                </div>
            </section>

            {/* ── host CTA banner ── */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 border border-violet-500/25 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* background glow */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-widest">For organisers</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                            Want to host an event?
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 max-w-md">
                            Create an event, share the code with your audience, and manage questions from your dashboard.
                        </p>
                    </div>

                    <Link
                        href="/admin/login"
                        className="relative z-10 shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In to Get Started
                    </Link>
                </div>
            </section>

            {/* ── footer ── */}
            <footer className="relative z-10 text-center pb-10 text-slate-600 text-xs">
                © {new Date().getFullYear()} VaultQ · Private moderated live Q&amp;A
            </footer>
        </div>
    );
}
