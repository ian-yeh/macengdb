import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompany, fetchCompanyExperiences } from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ExperiencesSection from '../components/companyPage/ExperiencesSection';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();

    const { data: company, isLoading, error } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => fetchCompany(companyId!),
        enabled: !!companyId,
    });

    const { data: experiences, isLoading: experiencesLoading, error: experiencesError } = useQuery({
        queryKey: ['experiences', companyId],
        queryFn: () => fetchCompanyExperiences(companyId!),
        enabled: !!companyId,
    });

    console.log(company, experiences);

    if (isLoading || experiencesLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-[#666]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p>Loading company details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !company || experiencesError || !experiences) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-[#666]">
                    <h1 className="text-2xl font-bold mb-4">Company not found</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#333] text-white py-2.5 px-6 rounded-md hover:bg-[#555] transition-colors"
                    >
                        Back to Companies
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main>
                {/* Company Header Section */}
                <section className="bg-gradient-to-b from-white to-[#f9f9f9] py-10 pb-[60px] border-b border-[#e0e0e0]">
                    <div className="max-w-[1200px] mx-auto px-5">
                        <button
                            className="bg-transparent border-none text-[#666] text-sm cursor-pointer mb-5 py-2 px-3 rounded-md transition-colors hover:bg-[#f0f0f0]"
                            onClick={() => navigate('/')}
                        >
                            ← Back to Companies
                        </button>
                        <div className="grid grid-cols-[1fr_auto] gap-10 items-start max-md:grid-cols-1">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] rounded-lg flex items-center justify-center border border-[#ddd]">
                                        <span className="text-3xl font-bold text-[#999]">
                                            {company.name?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="font-playfair text-[42px] font-bold text-[#222] max-md:text-[32px] leading-tight">
                                            {company.name}
                                        </h1>
                                        <div className="text-[#666] font-inter">{company.industries.join(' • ')}</div>
                                    </div>
                                </div>

                            </div>

                            <div className="flex gap-5 max-md:w-full max-md:justify-between">
                                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] shadow-sm">
                                    <div className="text-2xl font-semibold text-[#333] mb-1">⭐ {company.rating?.toFixed(1) || '0.0'}</div>
                                    <div className="text-[13px] text-[#888]">Overall Rating</div>
                                </div>
                                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] shadow-sm">
                                    <div className="text-2xl font-semibold text-[#333] mb-1">💬 {company.review_count || 0}</div>
                                    <div className="text-[13px] text-[#888]">Experiences</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experiences Section */}
                <ExperiencesSection experiences={experiences} />
            </main>

            <Footer />
        </div>
    );
}
