import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Company } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '../api/api';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: companies = [], isLoading, error } = useQuery({
        queryKey: ['companies'],
        queryFn: () => fetchCompanies(),
    });

    const filteredCompanies = companies.filter((company: Company) => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.industries.some(ind => ind.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleCompanyClick = (companyId: number) => {
        navigate(`/company/${companyId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#666]">
                <div className="text-center">
                    <p className="italic">Loading companies...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[#666]">
                <p className="italic">Failed to load companies. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <div className='flex justify-between items-center'>
                    <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mb-6">
                        MacEngDB
                    </h1>
                    <Link to="/signin" className="no-underline">
                        <h3 className='text-maceng-maroon hover:text-maceng-orange transition-colors mb-6'>Sign in</h3>
                    </Link>
                </div>
                <p className="text-[15px] leading-relaxed text-[#333] max-w-2xl mb-4">
                    Welcome to the interview database of engineering students at{' '}
                    <a
                        href="https://www.eng.mcmaster.ca/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                    >
                        McMaster University
                    </a>{' '}
                    in Hamilton, Ontario, Canada. This is an ongoing project to document co-op and internship
                    interview experiences, helping students prepare smarter.
                </p>
                <p className="text-[15px] leading-relaxed text-[#333]">
                    If you're a McMaster Engineering student, we welcome your contributions (
                    <a
                        href="#contribute"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                    >
                        submit an experience
                    </a>
                    ).
                </p>
            </header>

            {/* Search */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                />
            </div>

            {/* Company List Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[15px]">
                    <thead>
                        <tr className="border-b-2 border-maceng-maroon/20">
                            <th className="text-left py-3 pr-8 font-playfair italic text-maceng-maroon font-normal text-lg">
                                Company
                            </th>
                            <th className="text-left py-3 pr-8 font-playfair italic text-maceng-maroon font-normal text-lg">
                                Industry
                            </th>
                            <th className="text-left py-3 pr-8 font-playfair italic text-maceng-maroon font-normal text-lg">
                                Rating
                            </th>
                            <th className="text-left py-3 font-playfair italic text-maceng-maroon font-normal text-lg">
                                Experiences
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((company: Company) => (
                            <tr
                                key={company.id}
                                className="border-b border-[#e5e5e5] hover:bg-[#fafafa] transition-colors cursor-pointer"
                                onClick={() => handleCompanyClick(company.id)}
                            >
                                <td className="py-2.5 pr-8">
                                    <span className="font-medium text-[#333] hover:text-maceng-orange transition-colors">
                                        {company.name}
                                    </span>
                                </td>
                                <td className="py-2.5 pr-8 text-[#555]">
                                    {company.industries.join(', ')}
                                </td>
                                <td className="py-2.5 pr-8 text-[#555]">
                                    {company.rating.toFixed(1)}
                                </td>
                                <td className="py-2.5">
                                    <span className="font-mono text-maceng-orange">
                                        {company.review_count}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredCompanies.length === 0 && (
                <div className="text-center py-12 text-[#666] italic">
                    No companies found matching your search.
                </div>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] text-[13px] text-[#666]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
