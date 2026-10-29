import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDesignTeams, searchCompanies, submitDesignTeamReview, submitExperience } from '../api/api';
import ExperienceCard from '../components/ExperienceCard';
import RequestModal from '../components/RequestModal';
import useDebounce from '../hooks/useDebounce';

type Kind = 'job' | 'team';
interface Org { id?: number; name: string }
interface Stage { name: string; duration: string; questions: string }

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR + 1, THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3, THIS_YEAR - 4];
const DIFFICULTY = ['Easy', 'Fair', 'Moderate', 'Hard', 'Brutal'];
const ROUNDS = ['Online assessment', 'Recruiter screen', 'Technical', 'Behavioural', 'Take-home', 'Other'];
const PROMPTS = ['Was there an application form?', 'What did they ask?', 'Any task or project?', 'How long until you heard back?'];

const COPY = {
    job: {
        title: 'Share your interview',
        lede: 'Walk the next student through what happened. Short answers are fine; the rounds are what people read most.',
        org: 'Company',
        orgPlaceholder: 'Start typing, e.g. IBM',
        position: 'e.g. Software Developer Co-op',
        outcome: 'Did you get an offer?',
        outcomeLabels: ['Offer', 'No offer'] as [string, string],
        sources: ['OscarPlus', 'LinkedIn', 'Referral', 'Career fair', 'Cold email'],
        back: { to: '/', label: 'Back to companies' },
    },
    team: {
        title: 'Share your application',
        lede: 'Tell the next applicant how getting onto the team actually worked. Short answers are fine.',
        org: 'Design team',
        orgPlaceholder: 'Start typing, e.g. Formula Electric',
        position: 'e.g. Electrical subteam member',
        outcome: 'Were you accepted?',
        outcomeLabels: ['Accepted', 'Not accepted'] as [string, string],
        sources: ['Club fair', 'Instagram', 'Discord', 'Friend', 'Website'],
        back: { to: '/?tab=design-teams', label: 'Back to design teams' },
    },
};

const isMacEmail = (email: string) => /^[^\s@]+@mcmaster\.ca$/i.test(email.trim());

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
    return (
        <fieldset className="mt-9 border-t border-line pt-7">
            <legend className="contents">
                <span className="block font-playfair text-[22px] font-semibold">{title}</span>
            </legend>
            {hint && <p className="mt-1 text-sm text-ink-3">{hint}</p>}
            {children}
        </fieldset>
    );
}

function Field({ label, optional, htmlFor, children }: { label: string; optional?: boolean; htmlFor?: string; children: ReactNode }) {
    const Label = htmlFor ? 'label' : 'span';
    return (
        <div className="mt-[18px]">
            <Label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold">
                {label} {optional && <span className="font-normal text-ink-3">Optional</span>}
            </Label>
            {children}
        </div>
    );
}

export default function SubmitPage({ initialKind }: { initialKind: Kind }) {
    const location = useLocation();
    const queryClient = useQueryClient();
    const prefill = (location.state as { org?: Org } | null)?.org;

    const [kind, setKind] = useState<Kind>(initialKind);
    const [orgQuery, setOrgQuery] = useState(prefill?.name ?? '');
    const [picked, setPicked] = useState<Org | null>(prefill ?? null);
    const [listOpen, setListOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [position, setPosition] = useState('');
    const [season, setSeason] = useState('');
    const [year, setYear] = useState('');
    const [ok, setOk] = useState<boolean | null>(null);
    const [difficulty, setDifficulty] = useState<number | null>(null);
    const [source, setSource] = useState('');
    const [stages, setStages] = useState<Stage[]>([]);
    const [story, setStory] = useState('');
    const [tips, setTips] = useState('');
    const [email, setEmail] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const copy = COPY[kind];
    const job = kind === 'job';
    const q = orgQuery.trim();
    const debounced = useDebounce(q, 300);

    const { data: companyHits = [] } = useQuery({
        queryKey: ['companies', 'search', debounced],
        queryFn: () => searchCompanies(debounced),
        enabled: job && !!debounced,
    });
    const { data: teams = [] } = useQuery({
        queryKey: ['design-teams'],
        queryFn: () => fetchDesignTeams(),
        enabled: !job,
    });

    const hits: Org[] = (job ? companyHits : teams.filter(t => t.name.toLowerCase().includes(q.toLowerCase())))
        .slice(0, 5)
        .map(o => ({ id: o.id, name: o.name }));
    const exact = hits.some(h => h.name.toLowerCase() === q.toLowerCase());
    const options: { label: string; org?: Org; isNew?: boolean }[] = [
        ...hits.map(h => ({ label: h.name, org: h })),
        ...(q && !exact ? [{ label: job ? `Add "${q}" as a new company` : `Request "${q}" as a new team`, isNew: true }] : []),
    ];

    // a typed company name that isn't in the list is submitted as a new company
    const org = picked ?? (job && q ? { name: q } : null);
    const term = season && year ? `${season} ${year}` : '';
    const cleanStages = stages
        .filter(s => s.name.trim())
        .map(s => ({
            name: s.name.trim(),
            duration: s.duration.trim() || undefined,
            questions: s.questions.split('\n').map(l => l.trim()).filter(Boolean),
        }));

    const missing = [
        !(job ? org : org?.id) && copy.org,
        !position.trim() && 'role title',
        !term && 'term',
        ok === null && 'outcome',
        difficulty === null && 'difficulty',
        job && cleanStages.length === 0 && 'at least one round',
        !job && !story.trim() && 'the process',
        !isMacEmail(email) && 'McMaster email',
    ].filter(Boolean) as string[];

    const switchKind = (next: Kind) => {
        setKind(next);
        setOrgQuery('');
        setPicked(null);
        setSource('');
    };

    const choose = (i: number) => {
        const option = options[i];
        if (!option) return;
        setListOpen(false);
        if (option.org) {
            setPicked(option.org);
            setOrgQuery(option.org.name);
        } else if (!job) {
            setRequesting(true);
        }
    };

    const onOrgKey = (e: React.KeyboardEvent) => {
        if (!listOpen || !options.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % options.length); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + options.length) % options.length); }
        if (e.key === 'Enter') { e.preventDefault(); choose(active); }
        if (e.key === 'Escape') setListOpen(false);
    };

    const addRound = (name: string) => setStages([...stages, { name: name === 'Other' ? '' : name, duration: '', questions: '' }]);
    const updateRound = (i: number, patch: Partial<Stage>) => setStages(stages.map((s, j) => (j === i ? { ...s, ...patch } : s)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAttempted(true);
        setEmailTouched(true);
        setError('');
        if (missing.length || !org || ok === null || difficulty === null) return;

        const shared = {
            submitter_email: email.trim().toLowerCase(),
            position: position.trim(),
            term,
            difficulty,
            tips: tips.trim() || undefined,
            interview_acquisition: source || undefined,
        };
        setSubmitting(true);
        try {
            if (job) {
                await submitExperience({
                    ...shared,
                    company_id: org.id,
                    new_company_name: org.id ? undefined : org.name,
                    offer_received: ok,
                    stages: cleanStages,
                });
            } else {
                await submitDesignTeamReview({ ...shared, design_team_id: org.id!, accepted: ok, description: story.trim() });
            }
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
            setDone(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <main className="mx-auto max-w-[560px] px-4 py-24 text-center sm:px-6 animate-rise">
                <h1 className="text-[clamp(32px,4.4vw,44px)] font-bold leading-tight tracking-tight">Thanks, it's in review.</h1>
                <p className="mt-3 text-ink-2">A moderator checks each post before it goes live. Yours will help the next student prepare.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                    <Link to={copy.back.to} className="btn btn-primary btn-lg">{copy.back.label}</Link>
                    <button onClick={() => window.location.reload()} className="btn btn-ghost btn-lg">Share another</button>
                </div>
            </main>
        );
    }

    const preview = (
        <ExperienceCard
            title={position.trim() || <span className="italic text-ink-3">Role title</span>}
            term={term || <span className="italic text-ink-3">Term</span>}
            subtitle={org?.name || <span className="italic">{copy.org}</span>}
            outcome={ok}
            outcomeLabels={copy.outcomeLabels}
            difficulty={difficulty ?? 0}
            source={source}
            stages={job ? cleanStages : undefined}
            body={
                job
                    ? cleanStages.length === 0 && <p className="mt-4 italic text-ink-3">Your rounds will appear here.</p>
                    : <p className={`mt-4 whitespace-pre-wrap text-sm ${story.trim() ? 'text-ink-2' : 'italic text-ink-3'}`}>{story.trim() || 'Your story will appear here.'}</p>
            }
            tip={tips.trim()}
        />
    );

    return (
        <main className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <div className="grid gap-14 pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                <form onSubmit={handleSubmit} noValidate className="animate-rise">
                    <h1 className="text-[clamp(32px,4.4vw,44px)] font-bold leading-[1.08] tracking-tight">{copy.title}</h1>
                    <p className="mt-2.5 max-w-[34em] text-ink-2">{copy.lede}</p>

                    <div className="seg mt-6" role="group" aria-label="Experience type">
                        <button type="button" aria-pressed={job} onClick={() => switchKind('job')}>Co-op or job</button>
                        <button type="button" aria-pressed={!job} onClick={() => switchKind('team')}>Design team</button>
                    </div>

                    <Section title="The role">
                        <Field label={copy.org} htmlFor="org">
                            <div className="relative">
                                <input
                                    id="org"
                                    role="combobox"
                                    aria-expanded={listOpen && options.length > 0}
                                    aria-controls="org-list"
                                    aria-activedescendant={listOpen ? `org-${active}` : undefined}
                                    autoComplete="off"
                                    value={orgQuery}
                                    onChange={(e) => { setOrgQuery(e.target.value); setPicked(null); setListOpen(true); setActive(0); }}
                                    onFocus={() => setListOpen(true)}
                                    onBlur={() => setTimeout(() => setListOpen(false), 150)}
                                    onKeyDown={onOrgKey}
                                    placeholder={copy.orgPlaceholder}
                                    className="field"
                                />
                                {listOpen && q && !picked && options.length > 0 && (
                                    <ul id="org-list" role="listbox" className="absolute inset-x-0 top-[calc(100%+6px)] z-10 rounded-[10px] border border-line bg-surface p-1 shadow-card">
                                        {options.map((o, i) => (
                                            <li
                                                key={o.label}
                                                id={`org-${i}`}
                                                role="option"
                                                aria-selected={i === active}
                                                onMouseDown={(e) => { e.preventDefault(); choose(i); }}
                                                onMouseEnter={() => setActive(i)}
                                                className={`cursor-pointer rounded-md px-2.5 py-2 text-sm ${i === active ? 'bg-sunken' : ''} ${o.isNew ? 'font-semibold text-accent' : ''}`}
                                            >
                                                {o.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Field>
                        <div className="grid gap-x-4 sm:grid-cols-2">
                            <Field label="Role title" htmlFor="position">
                                <input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder={copy.position} className="field" />
                            </Field>
                            <Field label="Term">
                                <div className="flex gap-2">
                                    <select value={season} onChange={(e) => setSeason(e.target.value)} aria-label="Season" className="field flex-1">
                                        <option value="">Season</option>
                                        {SEASONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                    <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year" className="field flex-1">
                                        <option value="">Year</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </Field>
                        </div>
                    </Section>

                    <Section title="How it went">
                        <Field label={copy.outcome}>
                            <div className="flex gap-2">
                                <button type="button" aria-pressed={ok === true} onClick={() => setOk(true)} className="choice aria-pressed:border-good aria-pressed:bg-good/10 aria-pressed:text-good">Yes</button>
                                <button type="button" aria-pressed={ok === false} onClick={() => setOk(false)} className="choice aria-pressed:border-bad aria-pressed:bg-bad/10 aria-pressed:text-bad">No</button>
                            </div>
                        </Field>
                        <Field label="How hard was it overall?">
                            <div className="grid grid-cols-5 gap-1.5">
                                {DIFFICULTY.map((label, i) => (
                                    <button
                                        key={label}
                                        type="button"
                                        aria-pressed={difficulty === i + 1}
                                        onClick={() => setDifficulty(i + 1)}
                                        className="choice h-auto px-1.5 pb-2 pt-2.5 text-center"
                                    >
                                        <b className="block font-mono text-base font-medium">{i + 1}</b>
                                        <small className="block text-[11px] font-normal leading-tight text-ink-3">{label}</small>
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="How did you get the interview?" optional>
                            <div className="flex flex-wrap gap-2">
                                {copy.sources.map(s => (
                                    <button key={s} type="button" aria-pressed={source === s} onClick={() => setSource(source === s ? '' : s)} className="choice">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </Section>

                    {job ? (
                        <Section title="The rounds" hint="Add each round in order. One question or detail per line.">
                            {stages.map((stage, i) => (
                                <div key={i} className="mt-3 rounded-xl border border-line bg-surface px-4 pb-4 pt-3.5">
                                    <div className="grid grid-cols-[24px_minmax(0,1fr)_32px] items-center gap-2.5 sm:grid-cols-[24px_minmax(0,1fr)_120px_32px]">
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/10 font-mono text-xs text-accent">{i + 1}</span>
                                        <input value={stage.name} onChange={(e) => updateRound(i, { name: e.target.value })} placeholder="Round name" aria-label={`Round ${i + 1} name`} className="field h-9" />
                                        <input value={stage.duration} onChange={(e) => updateRound(i, { duration: e.target.value })} placeholder="e.g. 45 min" aria-label={`Round ${i + 1} length`} className="field col-start-2 row-start-2 h-9 sm:col-start-auto sm:row-start-auto" />
                                        <button
                                            type="button"
                                            onClick={() => setStages(stages.filter((_, j) => j !== i))}
                                            aria-label={`Remove round ${i + 1}`}
                                            className="col-start-3 row-start-1 grid h-8 w-8 place-items-center rounded-md text-ink-3 hover:bg-bad/10 hover:text-bad sm:col-start-auto"
                                        >
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                                        </button>
                                    </div>
                                    <textarea
                                        value={stage.questions}
                                        onChange={(e) => updateRound(i, { questions: e.target.value })}
                                        placeholder="What did they ask? One per line."
                                        aria-label={`Round ${i + 1} questions`}
                                        autoFocus={i === stages.length - 1 && !stage.questions}
                                        className="field mt-2.5 min-h-[76px]"
                                    />
                                </div>
                            ))}
                            <div className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Add a round">
                                {ROUNDS.map(r => (
                                    <button key={r} type="button" onClick={() => addRound(r)} className="h-8 rounded-full border border-dashed border-ink-3 px-3 text-[13px] text-ink-2 hover:border-solid hover:border-accent hover:text-accent">
                                        + {r}
                                    </button>
                                ))}
                            </div>
                        </Section>
                    ) : (
                        <Section title="The process" hint="What did applying look like, from first form to final answer?">
                            <Field label="Your story" htmlFor="story">
                                <textarea id="story" value={story} onChange={(e) => setStory(e.target.value)} placeholder="e.g. Short application form, then a 20 minute interview with two leads..." className="field min-h-[160px]" />
                            </Field>
                            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Writing prompts">
                                {PROMPTS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setStory(s => `${s}${s && !s.endsWith('\n') ? '\n\n' : ''}${p} `)}
                                        className="rounded-full bg-sunken px-2.5 py-1 text-xs text-ink-2 hover:text-accent"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </Section>
                    )}

                    <Section title="Advice and verification">
                        <Field label="One thing you'd tell the next applicant" optional htmlFor="tips">
                            <textarea id="tips" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="e.g. Review your resume projects; they asked about every one." className="field" />
                        </Field>
                        <Field label="McMaster email" htmlFor="email">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                                placeholder="macid@mcmaster.ca"
                                aria-invalid={emailTouched && !!email && !isMacEmail(email)}
                                aria-describedby="email-help"
                                className="field"
                            />
                            <p id="email-help" className="mt-1.5 text-xs text-ink-3">Used only to confirm you're a student. It's never shown with your post.</p>
                            {emailTouched && email && !isMacEmail(email) && <p className="mt-1.5 text-[13px] text-bad">Use your @mcmaster.ca address.</p>}
                        </Field>
                    </Section>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
                            {submitting ? 'Submitting...' : 'Submit for review'}
                        </button>
                        <button type="button" onClick={() => setPreviewOpen(true)} className="btn btn-ghost btn-lg lg:hidden">Preview</button>
                        <span className="text-[13px] text-ink-3">A moderator checks each post before it goes live.</span>
                    </div>
                    <div aria-live="polite" className="mt-3 text-sm text-bad">
                        {attempted && missing.length > 0 && <p>Still needed: {missing.join(', ')}.</p>}
                        {error && <p>{error}</p>}
                    </div>
                </form>

                <aside
                    aria-label="Preview"
                    className={`${previewOpen ? 'fixed inset-0 z-40 block overflow-auto bg-bg px-4 pb-24 pt-6' : 'hidden'} lg:sticky lg:top-[84px] lg:block lg:self-start lg:p-0`}
                >
                    <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-ink-3">
                        <span>Preview of your post</span>
                        <button type="button" onClick={() => setPreviewOpen(false)} className="btn btn-ghost lg:hidden">Close</button>
                    </div>
                    {preview}
                </aside>
            </div>

            {requesting && <RequestModal kind="design team" initialName={q} onClose={() => setRequesting(false)} />}
        </main>
    );
}
