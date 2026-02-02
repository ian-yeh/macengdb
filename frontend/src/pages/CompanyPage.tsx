import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompany, fetchCompanyExperiences } from '../api/api';
import { type Experience as ExperienceType } from '../api/types';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();

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
        return (
            <div className="min-h-screen flex items-center justify-center text-[#666]">
                <p className="italic">Loading company details...</p>
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
                <Link
                    to="/"
                    className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm"
                >
                    ← Back to companies
                </Link>

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    {company.name}
                </h1>

                <p className="text-[15px] text-[#555] mb-4">
                    {company.industries.join(' · ')}
                </p>

                <div className="flex gap-8 text-sm text-[#666] border-b border-[#e5e5e5] pb-6">
                    <span>
                        <span className="text-maceng-maroon font-medium">{company.rating?.toFixed(1) || '—'}</span> rating
                    </span>
                    <span>
                        <span className="text-maceng-maroon font-medium">{company.review_count || 0}</span> experiences
                    </span>
                </div>
            </header>

            {/* Experiences List */}
            <section>
                <h2 className="font-playfair italic text-maceng-maroon text-xl mb-6">
                    Interview Experiences
                </h2>

                {experiences.length === 0 ? (
                    <p className="text-[#666] italic py-8">
                        No experiences shared yet. Be the first to{' '}
                        <a href="#contribute" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange">
                            submit an experience
                        </a>.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {experiences.map((experience: ExperienceType) => {
                            const formattedDate = new Date(experience.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                            });

                            return (
                                <article key={experience.id} className="border-b border-[#e5e5e5] pb-6">
                                    <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                                        <h3 className="font-medium text-[#333]">{experience.title}</h3>
                                        <span className="text-sm text-[#888] font-mono">{formattedDate}</span>
                                    </div>
                                    <p className="text-[15px] text-[#444] leading-relaxed whitespace-pre-wrap">
                                        {experience.description}
                                    </p>
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
