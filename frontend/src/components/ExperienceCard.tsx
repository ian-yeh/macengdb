import type { ReactNode } from 'react';
import type { InterviewStage } from '../api/types';

export function Pips({ value }: { value: number }) {
    const on = Math.round(value);
    return (
        <span className="inline-flex gap-[3px] align-middle" role="img" aria-label={`Difficulty ${on} of 5`}>
            {[1, 2, 3, 4, 5].map(i => (
                <i key={i} className={`h-1.5 w-3.5 rounded-sm ${i <= on ? 'bg-accent' : 'bg-line'}`} />
            ))}
        </span>
    );
}

interface ExperienceCardProps {
    title: ReactNode;
    term: ReactNode;
    subtitle?: ReactNode;
    outcome: boolean | null;
    outcomeLabels: [string, string];
    difficulty: number;
    source?: string | null;
    stages?: InterviewStage[];
    body?: ReactNode;
    tip?: string | null;
    date?: string;
}

export default function ExperienceCard({
    title, term, subtitle, outcome, outcomeLabels, difficulty, source, stages, body, tip, date,
}: ExperienceCardProps) {
    return (
        <article className="rounded-[14px] border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <h3 className="text-[21px] leading-tight">{title}</h3>
                <span className="whitespace-nowrap pt-1 font-mono text-xs text-ink-3">{term}</span>
            </div>
            {subtitle && <div className="mt-0.5 text-[13px] text-ink-3">{subtitle}</div>}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-ink-2">
                {outcome === null ? (
                    <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2">Outcome</span>
                ) : (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${outcome ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad'}`}>
                        {outcome ? outcomeLabels[0] : outcomeLabels[1]}
                    </span>
                )}
                <span className="inline-flex items-center gap-1.5">Difficulty <Pips value={difficulty} /></span>
                {source && <span>Applied via {source}</span>}
            </div>

            {stages && stages.length > 0 && (
                <ol className="mt-5">
                    {stages.map((stage, i) => (
                        <li key={i} className="relative pb-[18px] pl-9">
                            <span className="absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full bg-accent/10 font-mono text-xs text-accent">
                                {i + 1}
                            </span>
                            {i < stages.length - 1 && <span className="absolute bottom-1 left-[11.5px] top-7 w-px bg-line" />}
                            <span className="font-semibold">{stage.name}</span>
                            {stage.duration && <span className="ml-1.5 text-[13px] text-ink-3">{stage.duration}</span>}
                            {stage.questions.length > 0 && (
                                <ul className="mt-1.5">
                                    {stage.questions.map((q, j) => (
                                        <li key={j} className="relative pl-3.5 text-sm text-ink-2 before:absolute before:left-0 before:top-[.7em] before:h-px before:w-1.5 before:bg-ink-3 before:content-['']">
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ol>
            )}

            {body}

            {tip && (
                <div className="mt-3 whitespace-pre-wrap rounded-[10px] bg-sunken px-4 py-3.5 text-sm text-ink-2">
                    <b className="mb-0.5 block text-xs text-accent-2">Tip</b>
                    {tip}
                </div>
            )}
            {date && <div className="mt-3.5 text-xs text-ink-3">Shared {date}</div>}
        </article>
    );
}
