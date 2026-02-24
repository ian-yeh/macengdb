import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompany, fetchCompanyExperiences } from '../api/api';
import { type Experience as ExperienceType } from '../api/types';
import CompanyDetailSkeleton from '../components/CompanyDetailSkeleton';
import { useEffect } from 'react';
import { usePostHog } from '@posthog/react';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();
    const posthog = usePostHog();

    const { data: company, isLoading, error } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => fetchCompany(companyId!),
        enabled: !!companyId,
    });

    const { data: experiences = [], isLoading: experiencesLoading, error: experiencesError } = useQuery({
        queryKey: ['experiences', companyId],
        queryFn: () => fetchCompanyExperiences(companyId!),
        enabled: !!companyId,
    });

    useEffect(() => {
        if (company) {
            posthog.capture('company_viewed', {
                company_id: company.id,
                company_name: company.name
            });
        }
    }, [company, posthog]);

    if (isLoading || experiencesLoading) {
        return (
            <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
                <CompanyDetailSkeleton />
            </div>
        );
    }

    if (error || !company || experiencesError) {
        return (
            <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
                <Link to="/" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange">
                    ← Back to companies
                </Link>
                <p className="mt-8 text-[#666] italic">Company not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <div className="animate-row-in">
                    <Link
                        to="/"
                        onClick={() => posthog.capture('back_to_companies_clicked')}
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm"
                    >
                        ← Back to companies
                    </Link>
                </div>

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon dark:text-maceng-orange mt-6 mb-2 animate-row-in" style={{ animationDelay: '50ms' }}>
                    {company.name}
                </h1>

                <p className="text-[15px] text-[#555] dark:text-[#e5e5e5] mb-4 animate-row-in" style={{ animationDelay: '100ms' }}>
                    {company.industries.join(' · ')}
                </p>

                <div className="flex gap-8 text-sm text-[#666] dark:text-[#d4d4d4] border-b border-[#e5e5e5] dark:border-[#444] pb-6 animate-row-in" style={{ animationDelay: '150ms' }}>
                    <span>
                        <span className="text-maceng-maroon dark:text-maceng-orange font-medium">{experiences.length}</span> experiences
                    </span>
                </div>
            </header>

            {/* Experiences List */}
            <section>
                <h2 className="font-playfair italic text-maceng-maroon dark:text-maceng-orange text-xl mb-6 animate-row-in" style={{ animationDelay: '200ms' }}>
                    Interview Experiences
                </h2>

                {experiences.length === 0 ? (
                    <p className="text-[#666] dark:text-[#d4d4d4] italic py-8 animate-row-in" style={{ animationDelay: '250ms' }}>
                        No experiences shared yet. Be the first to{' '}
                        <Link
                            to="/submit"
                            onClick={() => posthog.capture('submit_experience_from_empty_clicked', { company_name: company.name })}
                            className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                        >
                            submit an experience
                        </Link>.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {experiences.map((experience: ExperienceType, index: number) => {
                            const formattedDate = new Date(experience.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                            });

                            return (
                                <article key={experience.id} className="border-b border-[#e5e5e5] dark:border-[#444] pb-8 animate-row-in" style={{ animationDelay: `${250 + index * 60}ms` }}>
                                    {/* Title row */}
                                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                        <h3 className="font-playfair text-lg text-[#222] dark:text-white">{experience.position}</h3>
                                        <span className="text-sm text-[#888] dark:text-[#a0a0a0] font-mono shrink-0">{experience.term}</span>
                                    </div>

                                    {/* Meta pills */}
                                    <div className="flex flex-wrap gap-2 mb-5 text-xs">
                                        <span className="px-2.5 py-1 rounded-full bg-maceng-maroon/10 dark:bg-maceng-maroon/20 text-maceng-maroon dark:text-maceng-orange font-medium">
                                            Difficulty: {experience.difficulty}/5
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full font-medium ${experience.offer_received
                                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                                            : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {experience.offer_received ? '✓ Offer received' : '✗ No offer'}
                                        </span>
                                    </div>

                                    {/* Interview Acquisition / Source - Highlighted */}
                                    {experience.interview_acquisition && (
                                        <div className="mb-5 flex items-center gap-2.5 animate-row-in" style={{ animationDelay: `${300 + index * 60}ms` }}>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-maceng-orange/5 dark:bg-maceng-orange/10 border border-maceng-orange/20 dark:border-maceng-orange/40 rounded-lg group">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-maceng-orange/60">Applied via</span>
                                                <span className="text-[13px] text-maceng-orange font-semibold">{experience.interview_acquisition}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interview Stages */}
                                    {experience.stages && experience.stages.length > 0 && (
                                        <div className="mb-5">
                                            <p className="text-[11px] uppercase tracking-widest text-[#999] dark:text-[#a0a0a0] font-semibold mb-3">Interview Process</p>
                                            <div className="border-l-2 border-maceng-maroon/15 dark:border-maceng-maroon/30 ml-1 space-y-0">
                                                {experience.stages.map((stage, i) => (
                                                    <div key={i} className="pl-5 py-2.5 relative">
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-[-5px] top-[14px] w-2 h-2 rounded-full bg-maceng-maroon/40" />
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-[11px] text-[#aaa] dark:text-[#a0a0a0] font-mono">{i + 1}.</span>
                                                            <span className="text-sm font-medium text-[#333] dark:text-white">{stage.name}</span>
                                                            {stage.duration && <span className="text-xs text-[#999] dark:text-[#777]">({stage.duration})</span>}
                                                        </div>
                                                        {stage.questions.length > 0 && (
                                                            <ul className="ml-5 mt-1 space-y-0.5">
                                                                {stage.questions.map((q, j) => (
                                                                    <li key={j} className="text-sm text-[#555] dark:text-[#bbb] before:content-['–'] before:mr-2 before:text-[#ccc] dark:before:text-[#444]">{q}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {experience.tips && (
                                        <div className="bg-[#fffbf5] dark:bg-[#1a1612] border-l-3 border-maceng-orange/40 dark:border-maceng-orange/60 rounded-r px-4 py-3 mb-3">
                                            <p className="text-[11px] uppercase tracking-widest text-maceng-orange/70 font-semibold mb-1">Tips</p>
                                            <p className="text-sm text-[#444] dark:text-white leading-relaxed whitespace-pre-wrap">{experience.tips}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-[#bbb] dark:text-[#999999] mt-3">{formattedDate}</p>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] dark:border-[#444] text-[13px] text-[#666] dark:text-[#d4d4d4]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
