import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompany, fetchCompanyExperiences } from '../api/api';
import { type Experience as ExperienceType } from '../api/types';
import Loader from '../components/Loader';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();

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

    if (isLoading || experiencesLoading) {
        return <Loader message="Loading company details..." />;
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
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm"
                    >
                        ← Back to companies
                    </Link>
                </div>

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2 animate-row-in" style={{ animationDelay: '50ms' }}>
                    {company.name}
                </h1>

                <p className="text-[15px] text-[#555] mb-4 animate-row-in" style={{ animationDelay: '100ms' }}>
                    {company.industries.join(' · ')}
                </p>

                <div className="flex gap-8 text-sm text-[#666] border-b border-[#e5e5e5] pb-6 animate-row-in" style={{ animationDelay: '150ms' }}>
                    <span>
                        <span className="text-maceng-maroon font-medium">{experiences.length}</span> experiences
                    </span>
                </div>
            </header>

            {/* Experiences List */}
            <section>
                <h2 className="font-playfair italic text-maceng-maroon text-xl mb-6 animate-row-in" style={{ animationDelay: '200ms' }}>
                    Interview Experiences
                </h2>

                {experiences.length === 0 ? (
                    <p className="text-[#666] italic py-8 animate-row-in" style={{ animationDelay: '250ms' }}>
                        No experiences shared yet. Be the first to{' '}
                        <Link to="/submit" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange">
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
                                <article key={experience.id} className="border-b border-[#e5e5e5] pb-8 animate-row-in" style={{ animationDelay: `${250 + index * 60}ms` }}>
                                    {/* Title row */}
                                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                        <h3 className="font-playfair text-lg text-[#222]">{experience.position}</h3>
                                        <span className="text-sm text-[#888] font-mono shrink-0">{experience.term}</span>
                                    </div>

                                    {/* Meta pills */}
                                    <div className="flex flex-wrap gap-2 mb-5 text-xs">
                                        <span className="px-2.5 py-1 rounded-full bg-maceng-maroon/10 text-maceng-maroon font-medium">
                                            Difficulty: {experience.difficulty}/5
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full font-medium ${experience.offer_received
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                            {experience.offer_received ? '✓ Offer received' : '✗ No offer'}
                                        </span>
                                    </div>

                                    {/* Interview Stages */}
                                    {experience.stages && experience.stages.length > 0 && (
                                        <div className="mb-5">
                                            <p className="text-[11px] uppercase tracking-widest text-[#999] font-semibold mb-3">Interview Process</p>
                                            <div className="border-l-2 border-maceng-maroon/15 ml-1 space-y-0">
                                                {experience.stages.map((stage, i) => (
                                                    <div key={i} className="pl-5 py-2.5 relative">
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-[-5px] top-[14px] w-2 h-2 rounded-full bg-maceng-maroon/40" />
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-[11px] text-[#aaa] font-mono">{i + 1}.</span>
                                                            <span className="text-sm font-medium text-[#333]">{stage.name}</span>
                                                            {stage.duration && <span className="text-xs text-[#999]">({stage.duration})</span>}
                                                        </div>
                                                        {stage.questions.length > 0 && (
                                                            <ul className="ml-5 mt-1 space-y-0.5">
                                                                {stage.questions.map((q, j) => (
                                                                    <li key={j} className="text-sm text-[#555] before:content-['–'] before:mr-2 before:text-[#ccc]">{q}</li>
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
                                        <div className="bg-[#fffbf5] border-l-3 border-maceng-orange/40 rounded-r px-4 py-3 mb-3">
                                            <p className="text-[11px] uppercase tracking-widest text-maceng-orange/70 font-semibold mb-1">Tips</p>
                                            <p className="text-sm text-[#444] leading-relaxed">{experience.tips}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-[#bbb] mt-3">{formattedDate}</p>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] text-[13px] text-[#666]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
