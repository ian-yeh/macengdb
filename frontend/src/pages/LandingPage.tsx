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
            await submitCompanyRequest(requestName.trim());
            setRequestStatus('success');
            setRequestName('');
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
            <header className="mb-8">
                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mb-6">
                    MacEngDB
                </h1>
                <p className="text-[15px] leading-relaxed text-[#333] mb-4">
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
                    interview experiences, helping MacEng students prepare smarter.
                </p>
                <p className="text-[15px] leading-relaxed text-[#333] mb-3">
                    If you're a <span className="font-bold text-maceng-maroon">McMaster</span> student, we welcome your contributions (
                    <Link
                        to="/submit"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange font-medium"
                    >
                        submit an experience
                    </Link>
                    ).
                </p>
                <p className="text-[12px] leading-relaxed text-[#666]">
                    Don't see your company?{' '}
                    <button
                        onClick={() => { setShowRequestModal(true); setRequestStatus('idle'); setRequestName(''); }}
                        className="text-maceng-orange font-semibold hover:text-maceng-maroon transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5"
                    >
                        Request it <span className="text-[10px]">→</span>
                    </button>
                </p>
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
                                    onKeyDown={(e) => e.key === 'Enter' && requestName.trim() && handleRequestSubmit()}
                                    placeholder="Company name"
                                    autoFocus
                                    className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon mb-3"
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
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search company or industry..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
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
                                Experiences
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCompanies.map((company: Company, index: number) => (
                            <tr
                                key={`${company.id}-${searchQuery}-${safePage}`}
                                className="border-b border-[#e5e5e5] hover:bg-[#fafafa] transition-colors cursor-pointer animate-row-in"
                                style={{ animationDelay: `${index * 40}ms` }}
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
                                    {company.experience_count}
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
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="px-3 py-1.5 text-sm rounded border border-[#ddd] text-[#555] hover:bg-[#fafafa] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 text-sm rounded border transition-colors ${page === safePage
                                ? 'bg-maceng-maroon text-white border-maceng-maroon'
                                : 'border-[#ddd] text-[#555] hover:bg-[#fafafa]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="px-3 py-1.5 text-sm rounded border border-[#ddd] text-[#555] hover:bg-[#fafafa] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        →
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
