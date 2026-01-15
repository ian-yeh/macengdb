import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { type Company } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '../api/api';

// Mock data
export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('All');

    const industries = ['All', 'Technology', 'Automotive & Energy', 'Finance', 'Consulting', 'Manufacturing'];

    // fetching companies for front page
    const { data: companies = [], isLoading, error } = useQuery({
        queryKey: ['companies'],
        queryFn: () => fetchCompanies(),
    });

    const filteredCompanies = companies.filter((company: Company) => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.industry.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
        return matchesSearch && matchesIndustry;
    });

    const handleCompanyClick = (companyId: number) => {
        navigate(`/company/${companyId}`);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main>
                <section className="py-20 text-center">
                    <div className="max-w-[1200px] mx-auto px-5">
                        <h1 className="text-[56px] mb-5 text-[#222] font-playfair font-semibold max-md:text-4xl">
                            Helping McMaster Engineering Students Prep Smarter for Co-op & Internships
                        </h1>
                        <p className="text-xl text-[#666] mb-10 max-w-[600px] mx-auto">
                            Insider interview knowledge from McMaster Engineering students.
                        </p>
                        <div className="max-w-[600px] mx-auto mb-[60px] relative">
                            <input
                                type="text"
                                placeholder="Search companies (e.g., Tesla, Google, Apple...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-4 px-5 text-base border-2 border-[#ddd] rounded-lg font-inter bg-white transition-colors focus:outline-none focus:border-[#333]"
                            />
                        </div>
                    </div>
                </section>

                <section className="py-10 pb-20">
                    <div className="max-w-[1200px] mx-auto px-5">
                        <div className="flex justify-between items-center mb-[30px] flex-wrap gap-5">
                            <h2 className="text-4xl text-[#222] font-playfair">Find Companies</h2>
                            <div className="flex gap-2.5 flex-wrap">
                                {industries.map(industry => (
                                    <button
                                        key={industry}
                                        className={`py-2 px-4 border rounded-md font-inter text-sm cursor-pointer transition-all ${selectedIndustry === industry
                                            ? 'border-[#333] bg-[#333] text-white'
                                            : 'border-[#ddd] bg-white text-[#666] hover:border-[#333] hover:bg-[#333] hover:text-white'
                                            }`}
                                        onClick={() => setSelectedIndustry(industry)}
                                    >
                                        {industry}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 max-md:grid-cols-1">
                            {filteredCompanies.map((company: Company) => (
                                <div
                                    key={company.id}
                                    className="bg-white rounded-xl p-6 border border-[#e0e0e0] transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                                    onClick={() => handleCompanyClick(company.id)}
                                >
                                    {/* Company Logo Placeholder */}
                                    <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] rounded-lg flex items-center justify-center border border-[#ddd]">
                                        <span className="text-2xl font-bold text-[#999]">
                                            {company.name.charAt(0)}
                                        </span>
                                    </div>

                                    <h3 className="font-playfair text-[22px] font-semibold mb-2 text-[#222]">
                                        {company.name}
                                    </h3>
                                    <div className="font-inter text-sm text-[#666] mb-3">
                                        {company.industry}
                                    </div>

                                    <div className="flex gap-5 mb-4 text-sm flex-wrap">
                                        <div className="flex items-center gap-1.5 text-[#666]">
                                            <span>⭐</span>
                                            <span className="text-[#333] font-semibold">{company.rating.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-[#f0f0f0] text-[13px] text-[#888]">
                                        <span className="flex items-center gap-1">💬 {company.review_count} experiences</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredCompanies.length === 0 && (
                            <div className="text-center py-20 text-[#666]">
                                <div className="text-4xl mb-4">🔍</div>
                                <p>No companies found matching your search.</p>
                            </div>
                        )}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
