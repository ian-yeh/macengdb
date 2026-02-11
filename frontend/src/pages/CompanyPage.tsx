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
                        <span className="text-maceng-maroon font-medium">{company.rating?.toFixed(1) || '—'}</span> rating
                    </span>
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
                                <article key={experience.id} className="border-b border-[#e5e5e5] pb-6 animate-row-in" style={{ animationDelay: `${250 + index * 60}ms` }}>
                                    <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                                        <h3 className="font-medium text-[#333]">{experience.position}</h3>
                                        <span className="text-sm text-[#888] font-mono">{experience.term}</span>
                                    </div>

                                    <div className="flex gap-4 text-sm text-[#666] mb-3">
                                        <span>Difficulty: <span className="font-medium text-maceng-maroon">{experience.difficulty}/5</span></span>
                                        <span>{experience.offer_received ? '✅ Offer received' : '❌ No offer'}</span>
                                    </div>

                                    {experience.stages && experience.stages.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs uppercase tracking-wide text-[#888] font-medium mb-2">Interview Stages</p>
                                            <div className="space-y-2">
                                                {experience.stages.map((stage, i) => (
                                                    <div key={i} className="text-sm text-[#444] bg-[#fafafa] rounded p-2.5">
                                                        <span className="font-medium">{stage.name}</span>
                                                        {stage.duration && <span className="text-[#888]"> · {stage.duration}</span>}
                                                        {stage.questions.length > 0 && (
                                                            <ul className="mt-1 ml-4 list-disc text-[#555]">
                                                                {stage.questions.map((q, j) => (
                                                                    <li key={j}>{q}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {experience.tips && (
                                        <div className="text-sm text-[#444] bg-[#fffbf5] border-l-2 border-maceng-orange/30 pl-3 py-1">
                                            <span className="text-xs uppercase tracking-wide text-[#888] font-medium">Tips: </span>
                                            {experience.tips}
                                        </div>
                                    )}

                                    <p className="text-xs text-[#aaa] mt-2">{formattedDate}</p>
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
