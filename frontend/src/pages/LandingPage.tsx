import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies, fetchDesignTeams, fetchRecentExperiences } from '../api/api';
import CompanyListSkeleton from '../components/features/companies/CompanyListSkeleton';
import { Pips } from '../components/ExperienceCard';
import RequestModal from '../components/RequestModal';

interface Row {
    id: number;
    href: string;
    name: string;
    tags: string[];
    difficulty: number | null;
    count: number;
}

const GRID = 'grid grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_112px_88px_20px]';

export default function LandingPage() {
    const [params, setParams] = useSearchParams();
    const teams = params.get('tab') === 'design-teams';
    const [search, setSearch] = useState('');
    const [industry, setIndustry] = useState('');
    const [offersOnly, setOffersOnly] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);
    const [requesting, setRequesting] = useState(false);

    const { data: companies = [], isLoading, error } = useQuery({
        queryKey: ['companies'],
        queryFn: () => fetchCompanies(),
    });
    const { data: withOffers } = useQuery({
        queryKey: ['companies', 'offers'],
        queryFn: () => fetchCompanies(undefined, undefined, undefined, true),
        enabled: offersOnly,
    });
    const { data: designTeams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
        queryKey: ['design-teams'],
        queryFn: () => fetchDesignTeams(),
    });
    const { data: recent = [] } = useQuery({
        queryKey: ['experiences', 'recent'],
        queryFn: fetchRecentExperiences,
    });

    const quotes = recent.flatMap(e => {
        const round = e.stages.findIndex(s => s.questions.some(q => q.trim()));
        if (round < 0 || !e.company_id) return [];
        const stage = e.stages[round];
        return [{ id: e.id, companyId: e.company_id, company: e.company_name, round: round + 1, stage: stage.name, term: e.term, text: stage.questions.find(q => q.trim())! }];
    }).slice(0, 4);

    const experienceCount =
        companies.reduce((n, c) => n + c.experience_count, 0) + designTeams.reduce((n, t) => n + t.review_count, 0);

    const offerIds = new Set(withOffers?.map(c => c.id));
    const rows: Row[] = teams
        ? designTeams.map(t => ({ id: t.id, href: `/design-teams/${t.id}`, name: t.name, tags: t.categories, difficulty: t.avg_difficulty, count: t.review_count }))
        : companies
            .filter(c => !industry || c.industries.includes(industry))
            .filter(c => !offersOnly || !withOffers || offerIds.has(c.id))
            .map(c => ({ id: c.id, href: `/company/${c.id}`, name: c.name, tags: c.industries, difficulty: c.avg_difficulty, count: c.experience_count }));

    const q = search.trim().toLowerCase();
    const matches = rows
        .filter(r => !q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const shown = q || showEmpty ? matches : matches.filter(r => r.count > 0);
    const hiddenCount = matches.length - shown.length;

    const industries = [...new Set(companies.flatMap(c => c.industries))].sort();
    const noun = teams ? 'design team' : 'company';
    const nouns = teams ? 'design teams' : 'companies';
    const loading = teams ? teamsLoading : isLoading;
    const failed = teams ? teamsError : error;

    const switchTab = (toTeams: boolean) => {
        setParams(toTeams ? { tab: 'design-teams' } : {}, { replace: true });
        setSearch('');
        setShowEmpty(false);
    };

    return (
        <main className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <section className={`grid items-center gap-10 py-10 md:py-[72px] ${quotes.length ? 'md:grid-cols-[1.05fr_1fr] md:gap-14' : ''}`}>
                <div className="animate-rise">
                    <h1 className="text-[clamp(44px,6vw,72px)] font-bold leading-[1.02] tracking-[-.02em]">
                        Know before<br />you <em className="text-accent">interview.</em>
                    </h1>
                    <p className="mt-5 max-w-[30em] text-lg text-ink-2">
                        Real interview experiences from McMaster engineering students. See what each round asked, how hard it was, and who got the offer.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2.5">
                        <a href="#directory" className="btn btn-primary btn-lg">Browse {nouns}</a>
                        <Link to={teams ? '/submit-design-team' : '/submit'} className="btn btn-ghost btn-lg">
                            Share your {teams ? 'application' : 'interview'}
                        </Link>
                    </div>
                    <p className="mt-[22px] text-base text-ink-3">
                        <b className="font-semibold text-ink">{experienceCount}</b> experiences across{' '}
                        <b className="font-semibold text-ink">{companies.length}</b> companies and{' '}
                        <b className="font-semibold text-ink">{designTeams.length}</b> design teams
                    </p>
                </div>

                {quotes.length > 0 && (
                    <div className="grid gap-3" aria-label="Recently asked in interviews">
                        {quotes.map((quote, i) => (
                            <Link
                                key={quote.id}
                                to={`/company/${quote.companyId}`}
                                style={{ animationDelay: `${80 + i * 60}ms` }}
                                className={`animate-rise rounded-xl border border-line bg-surface px-[18px] py-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40
                                    ${i === 1 ? 'md:ml-7' : ''} ${i === 2 ? 'md:ml-14 md:opacity-70' : ''} ${i === 3 ? 'max-md:hidden' : ''}`}
                            >
                                <blockquote className="line-clamp-3 font-playfair text-lg leading-snug">
                                    <span className="text-accent">&ldquo;</span>{quote.text}<span className="text-accent">&rdquo;</span>
                                </blockquote>
                                <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-xs text-ink-3">
                                    <b className="font-inter font-semibold text-ink">{quote.company}</b> · Round {quote.round} · {quote.stage} · {quote.term}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section id="directory" className="scroll-mt-20 border-t border-line pt-8">
                <div className="seg" role="group" aria-label="Directory">
                    <button aria-pressed={!teams} onClick={() => switchTab(false)}>
                        Companies <span className="ml-1 font-mono text-xs font-normal text-ink-3">{companies.length}</span>
                    </button>
                    <button aria-pressed={teams} onClick={() => switchTab(true)}>
                        Design teams <span className="ml-1 font-mono text-xs font-normal text-ink-3">{designTeams.length}</span>
                    </button>
                </div>

                <div className="mb-2 mt-5 flex flex-wrap gap-2.5">
                    <label className="relative min-w-[240px] flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={teams ? 'Search design teams or categories' : 'Search companies or industries'}
                            aria-label={`Search ${nouns}`}
                            className="field pl-[38px]"
                        />
                    </label>
                    {!teams && (
                        <>
                            <select value={industry} onChange={(e) => setIndustry(e.target.value)} aria-label="Industry" className="field">
                                <option value="">All industries</option>
                                {industries.map(i => <option key={i}>{i}</option>)}
                            </select>
                            <button aria-pressed={offersOnly} onClick={() => setOffersOnly(!offersOnly)} className="choice h-[42px]">
                                Offers only
                            </button>
                        </>
                    )}
                </div>

                {failed ? (
                    <p className="py-12 text-center text-ink-2">We couldn't load the {nouns}. Refresh to try again.</p>
                ) : loading ? (
                    <CompanyListSkeleton />
                ) : (
                    <>
                        <div className={`${GRID} border-b border-line px-2 pb-2 pt-4 text-xs font-semibold text-ink-3`}>
                            <span>{teams ? 'Design team' : 'Company'}</span>
                            <span className="max-sm:hidden">{teams ? 'Category' : 'Industry'}</span>
                            <span className="max-sm:hidden">Avg. difficulty</span>
                            <span className="text-right">Experiences</span>
                            <span />
                        </div>
                        <ul>
                            {shown.map(r => (
                                <li key={r.id}>
                                    <Link to={r.href} className={`${GRID} group border-b border-line px-2 py-3.5 transition-colors hover:bg-sunken`}>
                                        <span className="font-semibold">
                                            {r.name}
                                            <small className="block truncate text-xs font-normal text-ink-3 sm:hidden">{r.tags.join(', ')}</small>
                                        </span>
                                        <span className="truncate text-[13px] text-ink-3 max-sm:hidden">{r.tags.join(', ')}</span>
                                        <span className="max-sm:hidden">{r.difficulty ? <Pips value={r.difficulty} /> : null}</span>
                                        <span className="text-right font-mono text-[13px] text-ink-2">{r.count || '-'}</span>
                                        <span className="text-ink-3 transition group-hover:translate-x-[3px] group-hover:text-accent" aria-hidden="true">&rsaquo;</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {shown.length === 0 && (
                            <p className="py-10 text-center text-ink-2">
                                {q ? `No ${nouns} match "${search.trim()}".` : `No ${nouns} match these filters.`}
                            </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-dashed border-line px-4 py-3.5 text-sm text-ink-2">
                            {hiddenCount > 0 ? (
                                <>
                                    <span>{hiddenCount} more {hiddenCount === 1 ? noun : nouns} {hiddenCount === 1 ? 'has' : 'have'} no experiences yet.</span>
                                    <button onClick={() => setShowEmpty(true)} className="font-semibold text-accent">Show them</button>
                                </>
                            ) : (
                                <>
                                    <span>Can't find a {noun}?</span>
                                    <button onClick={() => setRequesting(true)} className="font-semibold text-accent">Request it</button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </section>

            {requesting && (
                <RequestModal kind={teams ? 'design team' : 'company'} initialName={search.trim()} onClose={() => setRequesting(false)} />
            )}
        </main>
    );
}
