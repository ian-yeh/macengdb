import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DetailPageProps {
    back: { to: string; label: string };
    title: string;
    tags: string[];
    description?: ReactNode;
    facts: [string, string][];
    share: { to: string; label: string; state: unknown };
    outcomeLabels: [string, string];
    items: { id: number; term: string; ok: boolean; card: ReactNode }[];
    empty: ReactNode;
}

export default function DetailPage({ back, title, tags, description, facts, share, outcomeLabels, items, empty }: DetailPageProps) {
    const [hidden, setHidden] = useState<Set<string>>(new Set());
    const toggle = (key: string) =>
        setHidden(h => {
            const next = new Set(h);
            if (!next.delete(key)) next.add(key);
            return next;
        });

    const terms = [...new Set(items.map(i => i.term))];
    const visible = items.filter(i => !hidden.has(`term:${i.term}`) && !hidden.has(`ok:${i.ok}`));
    const filters: [string, [string, string][]][] = [
        ['Term', terms.map(t => [`term:${t}`, t])],
        ['Outcome', [['ok:true', outcomeLabels[0]], ['ok:false', outcomeLabels[1]]]],
    ];

    return (
        <main className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <Link to={back.to} className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                {back.label}
            </Link>

            <section className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-7 pt-5 animate-rise">
                <div className="max-w-2xl">
                    <h1 className="text-[clamp(36px,5vw,52px)] font-bold leading-[1.05] tracking-tight">{title}</h1>
                    {tags.length > 0 && <div className="mt-2 text-ink-2">{tags.join(' · ')}</div>}
                    {description}
                    <dl className="mt-[18px] flex flex-wrap gap-7 text-[13px] text-ink-3">
                        {facts.map(([value, label]) => (
                            <div key={label} className="flex flex-col-reverse">
                                <dt>{label}</dt>
                                <dd className="font-mono text-lg text-ink">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <Link to={share.to} state={share.state} className="btn btn-primary">{share.label}</Link>
            </section>

            {items.length === 0 ? (
                <div className="py-10 text-ink-2">{empty}</div>
            ) : (
                <section className={`grid gap-5 pt-8 ${items.length > 1 ? 'md:grid-cols-[200px_minmax(0,1fr)] md:gap-12' : ''}`}>
                    {items.length > 1 && (
                        <aside className="flex flex-wrap gap-5 self-start text-[13px] md:sticky md:top-[84px] md:flex-col">
                            {filters.map(([heading, options]) => (
                                <fieldset key={heading}>
                                    <legend className="mb-2 text-xs font-semibold text-ink-3">{heading}</legend>
                                    {options.map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 py-1 text-ink-2">
                                            <input type="checkbox" checked={!hidden.has(key)} onChange={() => toggle(key)} className="accent-[rgb(var(--accent))]" />
                                            {label}
                                        </label>
                                    ))}
                                </fieldset>
                            ))}
                        </aside>
                    )}
                    <div className="space-y-4">
                        {visible.map((item, i) => (
                            <div key={item.id} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>{item.card}</div>
                        ))}
                        {visible.length === 0 && <p className="text-ink-3">No posts match these filters.</p>}
                    </div>
                </section>
            )}
        </main>
    );
}
