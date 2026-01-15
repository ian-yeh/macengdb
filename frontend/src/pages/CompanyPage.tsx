import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCompany } from '../api/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();

    const { data: company, isLoading, error } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => fetchCompany(companyId!),
        enabled: !!companyId,
    });

    console.log(company);

    if (isLoading) {
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

    if (error || !company) {
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
                                        <div className="text-[#666] font-inter">{company.industry} • {company.location || 'Location N/A'}</div>
                                    </div>
                                </div>
                                <p className="text-lg text-[#666] leading-relaxed max-w-[700px]">
                                    {company.description || "No description available."}
                                </p>
                            </div>

                            <div className="flex gap-5 max-md:w-full max-md:justify-between">
                                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] shadow-sm">
                                    <div className="text-2xl font-semibold text-[#333] mb-1">⭐ {company.rating?.toFixed(1) || '0.0'}</div>
                                    <div className="text-[13px] text-[#888]">Overall Rating</div>
                                </div>
                                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] shadow-sm">
                                    <div className="text-2xl font-semibold text-[#333] mb-1">💬 {company.reviewCount || 0}</div>
                                    <div className="text-[13px] text-[#888]">Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experiences Section */}
                <section className="py-10 pb-20">
                    <div className="max-w-[1200px] mx-auto px-5">
                        <h3 className="text-2xl font-playfair text-[#333] mb-8">Experiences</h3>
                        <div className="text-center py-20 text-[#666] bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <div className="text-4xl mb-4">💼</div>
                            <p className="text-lg">Experiences coming soon!</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
