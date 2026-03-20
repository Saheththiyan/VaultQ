import Link from 'next/link';

export interface BreadcrumbItem {
    label: string;
    /** Omit for the current (last) item */
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vaultq.cse23.org';

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <nav aria-label="Breadcrumb" className={className}>
                <ol className="flex items-center gap-1.5 text-sm">
                    {items.map((item, i) => {
                        const isLast = i === items.length - 1;
                        return (
                            <li key={i} className="flex items-center gap-1.5">
                                {i > 0 && (
                                    <svg
                                        className="w-3 h-3 text-slate-600 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                                {isLast ? (
                                    <span className="text-slate-300" aria-current="page">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
