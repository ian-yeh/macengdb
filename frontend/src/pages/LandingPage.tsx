import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type Company } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies, submitCompanyRequest } from '../api/api';
import Loader from '../components/Loader';

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const { data: companies = [], isLoading, error } = useQuery({
        queryKey: ['companies'],
        queryFn: () => fetchCompanies(),
    });

    const filteredCompanies = companies
        .filter((company: Company) => {
            const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.industries.some(ind => ind.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        })
        .sort((a: Company, b: Company) => b.experience_count - a.experience_count || a.name.localeCompare(b.name));

    const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedCompanies = filteredCompanies.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    const handleCompanyClick = (companyId: number) => {
        navigate(`/company/${companyId}`);
    };

    const handleRequestSubmit = async () => {
        if (!requestName.trim()) return;
        setRequestStatus('submitting');
        try {
            await submitCompanyRequest(requestName.trim(), requestEmail.trim() || undefined);
            setRequestStatus('success');
            setRequestName('');
            setRequestEmail('');
        } catch {
            setRequestStatus('error');
        }
    };

    if (isLoading) {
        return <Loader message="Loading companies..." />;
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
            <header className="mb-12">
                <h1 className="font-playfair text-4xl font-bold text-maceng-maroon mb-6 tracking-tight">
                    MacEngDB
                </h1>
                <div className="space-y-4">
                    <p className="text-[16px] leading-relaxed text-[#333]">
                        Welcome to the interview database for engineering students at{' '}
                        <a
                            href="https://www.eng.mcmaster.ca/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-maceng-orange font-medium underline decoration-maceng-orange/30 hover:decoration-maceng-orange transition-all"
                        >
                            McMaster University
                        </a>{' '}
                        in Hamilton, Ontario. We're on a mission to document co-op and internship
                        interview experiences, helping MacEng students prepare smarter.
                    </p>
                    <p className="text-[15px] leading-relaxed text-[#444] font-medium">
                        If you're a <span className="text-maceng-maroon">McMaster</span> student, we welcome your contributions (
                        <Link
                            to="/submit"
                            className="text-maceng-orange underline decoration-maceng-orange/30 hover:decoration-maceng-orange"
                        >
                            submit an experience
                        </Link>
                        ).
                    </p>
                    <p className="text-[13px] leading-relaxed text-[#777]">
                        Don't see your company?{' '}
                        <button
                            onClick={() => { setShowRequestModal(true); setRequestStatus('idle'); setRequestName(''); }}
                            className="text-maceng-orange font-bold hover:text-maceng-maroon transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5 group"
                        >
                            Request it <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                    </p>
                </div>
            </header>

            {/* Company Request Modal */}
            {showRequestModal && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRequestModal(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-playfair text-lg text-maceng-maroon mb-1">Request a Company</h3>
                        <p className="text-xs text-[#888] mb-4">An admin will review and add it shortly.</p>

                        {requestStatus === 'success' ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium text-sm">✓ Request submitted!</p>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="mt-3 text-xs text-[#888] hover:text-[#333]"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={requestName}
                                    onChange={(e) => setRequestName(e.target.value)}
                                    placeholder="Company name"
                                    autoFocus
                                    className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-3"
                                />
                                <input
                                    type="email"
                                    value={requestEmail}
                                    onChange={(e) => setRequestEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && requestName.trim() && handleRequestSubmit()}
                                    placeholder="Your email (optional)"
                                    className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-4"
                                />
                                {requestStatus === 'error' && (
                                    <p className="text-xs text-red-600 mb-2">Failed to submit. Try again.</p>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowRequestModal(false)}
                                        className="px-3 py-1.5 text-sm text-[#666] hover:text-[#333] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestSubmit}
                                        disabled={!requestName.trim() || requestStatus === 'submitting'}
                                        className="px-4 py-1.5 bg-maceng-maroon text-white text-sm rounded font-medium hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50"
                                    >
                                        {requestStatus === 'submitting' ? 'Sending...' : 'Submit'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-10 relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-[#999] group-focus-within:text-maceng-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search company or industry..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full py-3 pl-10 pr-4 text-sm border border-[#ddd] rounded-lg font-inter bg-white shadow-sm ring-maceng-orange/0 focus:ring-4 focus:border-maceng-maroon/40 focus:outline-none transition-all placeholder:text-[#aaa]"
                />
            </div>

            {/* Company List Table */}
            <div className="mb-8 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-maceng-maroon/20">
                            <th className="text-left py-3 pr-4 font-playfair italic text-maceng-maroon font-semibold text-[15px] md:text-[16px] uppercase tracking-wider">
                                Company
                            </th>
                            <th className="hidden md:table-cell text-left py-3 pr-6 font-playfair italic text-maceng-maroon font-semibold text-[16px] uppercase tracking-wider">
                                Industry
                            </th>
                            <th className="text-right md:text-center py-3 font-playfair italic text-maceng-maroon font-semibold text-[15px] md:text-[16px] uppercase tracking-wider w-24 md:w-32">
                                Experiences
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee]">
                        {paginatedCompanies.map((company: Company, index: number) => (
                            <tr
                                key={`${company.id}-${searchQuery}-${safePage}`}
                                className="group hover:bg-[#fafafa] transition-all cursor-pointer animate-row-in"
                                style={{ animationDelay: `${index * 30}ms` }}
                                onClick={() => handleCompanyClick(company.id)}
                            >
                                <td className="py-3 pr-4 transition-transform group-hover:translate-x-1 duration-200">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#333] group-hover:text-maceng-orange transition-colors">
                                            {company.name}
                                        </span>
                                        <span className="md:hidden text-[#888] text-[11px] italic font-inter mt-0.5 line-clamp-1">
                                            {company.industries.join(', ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="hidden md:table-cell py-3 pr-6 text-[#777] text-sm italic font-inter leading-tight">
                                    {company.industries.join(', ')}
                                </td>
                                <td className="py-3 text-right md:text-center">
                                    {company.experience_count > 0 ? (
                                        <span className="font-bold text-maceng-maroon text-[15px]">
                                            {company.experience_count}
                                        </span>
                                    ) : (
                                        <span className="text-[#bbb]">—</span>
                                    )}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#eee] text-[#777] hover:bg-[#fafafa] hover:border-[#ddd] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all ${page === safePage
                                ? 'bg-maceng-maroon text-white border-maceng-maroon shadow-md shadow-maceng-maroon/20'
                                : 'border-[#eee] text-[#777] hover:bg-[#fafafa] hover:border-[#ddd]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#eee] text-[#777] hover:bg-[#fafafa] hover:border-[#ddd] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
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
