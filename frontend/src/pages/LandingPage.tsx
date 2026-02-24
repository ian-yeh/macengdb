import { useState } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { type Company, type DesignTeam } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanies, fetchDesignTeams } from '../api/api';
import CompanyListSkeleton from '../components/CompanyListSkeleton';
import TabNav from '../components/TabNav';
import CompanyRequestModal from '../components/CompanyRequestModal';
import DesignTeamRequestModal from '../components/DesignTeamRequestModal';

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('All');
    const [minRating, setMinRating] = useState<number | undefined>(undefined);
    const [hasOffer, setHasOffer] = useState<boolean | undefined>(undefined);
    const [position, setPosition] = useState('');
    const debouncedPosition = useDebounce(position, 500);
    const [showFilters, setShowFilters] = useState(false);
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'design-teams' ? 'design-teams' : 'companies';
    const [activeTab, setActiveTab] = useState<'companies' | 'design-teams'>(initialTab);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [showCompanyRequestModal, setShowCompanyRequestModal] = useState(false);
    const [showDesignTeamRequestModal, setShowDesignTeamRequestModal] = useState(false);

    const { data: companies = [], isLoading, error } = useQuery({
        queryKey: ['companies', selectedIndustry, minRating, hasOffer, debouncedPosition],
        queryFn: () => fetchCompanies(
            undefined, // search is handled by local filtering
            selectedIndustry,
            minRating,
            hasOffer,
            debouncedPosition || undefined
        ),
    });

    const { data: designTeams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
        queryKey: ['design-teams'],
        queryFn: () => fetchDesignTeams(),
    });

    const filteredCompanies = companies
        .filter((company: Company) => {
            if (!searchQuery) return true;
            const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.industries.some(ind => ind.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        })
        .sort((a: Company, b: Company) => b.experience_count - a.experience_count || a.name.localeCompare(b.name));

    const filteredTeams = designTeams.filter((team: DesignTeam) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            team.name.toLowerCase().includes(q) ||
            team.categories.some(c => c.toLowerCase().includes(q)) ||
            (team.description && team.description.toLowerCase().includes(q))
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedCompanies = filteredCompanies.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    const handleCompanyClick = (companyId: number) => {
        navigate(`/company/${companyId}`);
    };

    const handleTeamClick = (teamId: number) => {
        navigate(`/design-teams/${teamId}`);
    };


    return (
        <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-maceng-maroon dark:text-maceng-orange mb-6 tracking-tight">
                    MacEngDB
                </h1>

                {/* Tab Navigation */}
                <TabNav activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSearchQuery(''); setCurrentPage(1); }} />

                <div className="space-y-4">
                    {activeTab === 'companies' ? (
                        <>
                            <p className="text-[14px] md:text-[16px] leading-relaxed text-[#333] dark:text-white">
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
                            <p className="text-[15px] leading-relaxed text-[#444] dark:text-[#e5e5e5] font-medium">
                                If you're a <span className="text-maceng-maroon dark:text-maceng-orange">McMaster</span> student, we welcome your contributions (
                                <Link
                                    to="/submit"
                                    className="text-maceng-orange font-bold underline decoration-maceng-orange/30 hover:decoration-maceng-orange"
                                >
                                    submit an interview experience
                                </Link>
                                ).
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-[14px] md:text-[16px] leading-relaxed text-[#333] dark:text-white">
                                Explore McMaster Engineering's design teams and student-run technical organizations.
                                Read about real application experiences from students to help you prepare.
                            </p>
                            <p className="text-[15px] leading-relaxed text-[#444] dark:text-[#e5e5e5] font-medium">
                                If you're a <span className="text-maceng-maroon dark:text-maceng-orange">McMaster</span> student, we welcome your contributions (
                                <Link
                                    to="/submit-design-team"
                                    className="text-maceng-orange font-bold underline decoration-maceng-orange/30 hover:decoration-maceng-orange"
                                >
                                    submit an application experience
                                </Link>
                                ).
                            </p>
                        </>
                    )}
                    <p className="text-[13px] leading-relaxed text-[#777] dark:text-[#d4d4d4]">
                        Don't see your company or design team?{' '}
                        <button
                            onClick={() => {
                                if (activeTab === 'companies') setShowCompanyRequestModal(true);
                                else setShowDesignTeamRequestModal(true);
                            }}
                            className="text-maceng-orange font-bold hover:text-maceng-maroon dark:hover:text-maceng-orange/80 transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5 group"
                        >
                            Request it <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                    </p>
                </div>
            </header>

            {/* Request Modals */}
            <CompanyRequestModal
                isOpen={showCompanyRequestModal}
                onClose={() => setShowCompanyRequestModal(false)}
            />
            <DesignTeamRequestModal
                isOpen={showDesignTeamRequestModal}
                onClose={() => setShowDesignTeamRequestModal(false)}
            />

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex gap-3">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-[#999] group-focus-within:text-maceng-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={activeTab === 'companies' ? "Search company or industry..." : "Search team or category..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full py-3 pl-10 pr-4 text-sm border border-[#ddd] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#111111] dark:text-white shadow-sm ring-maceng-orange/0 focus:ring-4 focus:border-maceng-maroon/40 focus:outline-none transition-all placeholder:text-[#aaa] dark:placeholder:text-[#666]"
                        />
                    </div>
                    {activeTab === 'companies' && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${showFilters ? 'bg-maceng-maroon text-white border-maceng-maroon' : 'bg-white dark:bg-[#111111] text-[#666] dark:text-[#e5e5e5] border-[#ddd] dark:border-[#444] hover:border-maceng-maroon/40'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                        </button>
                    )}
                </div>

                {activeTab === 'companies' && showFilters && (
                    <div className="p-4 md:p-5 bg-[#fafafa] dark:bg-[#111111] border border-[#eee] dark:border-[#444] rounded-xl flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 animate-fade-in shadow-sm">
                        {/* Industry Filter */}
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 dark:text-maceng-orange/60">Industry</label>
                            <select
                                value={selectedIndustry}
                                onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
                                className="py-2 px-3 text-sm border border-[#ddd] dark:border-[#444] rounded-lg bg-white dark:bg-[#161616] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all"
                            >
                                <option value="All">All Industries</option>
                                <option value="Software">Software</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Civil">Civil</option>
                                <option value="Chemical">Chemical</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Finance">Finance</option>
                                <option value="Consulting">Consulting</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div className="flex flex-col gap-2 min-w-[100px]">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 dark:text-maceng-orange/60">Min Rating</label>
                            <select
                                value={minRating || ''}
                                onChange={(e) => { setMinRating(e.target.value ? Number(e.target.value) : undefined); setCurrentPage(1); }}
                                className="py-2 px-3 text-sm border border-[#ddd] dark:border-[#444] rounded-lg bg-white dark:bg-[#161616] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all"
                            >
                                <option value="">Any</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>
                        </div>

                        {/* Offer Toggle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 dark:text-maceng-orange/60">Offer Status</label>
                            <label className="flex items-center gap-2 cursor-pointer py-2 group">
                                <input
                                    type="checkbox"
                                    checked={hasOffer === true}
                                    onChange={(e) => { setHasOffer(e.target.checked ? true : undefined); setCurrentPage(1); }}
                                    className="w-4 h-4 rounded border-[#ddd] dark:border-[#444] bg-white dark:bg-[#161616] text-maceng-maroon focus:ring-maceng-maroon transition-all"
                                />
                                <span className="text-sm text-[#444] dark:text-[#bbb] group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors">Only with offers</span>
                            </label>
                        </div>

                        {/* Position Search */}
                        <div className="flex flex-col gap-2 flex-grow">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 dark:text-maceng-orange/60">Position</label>
                            <input
                                type="text"
                                placeholder="Filter by role (e.g. Intern)"
                                value={position}
                                onChange={(e) => { setPosition(e.target.value); setCurrentPage(1); }}
                                className="py-2 px-3 text-sm border border-[#ddd] dark:border-[#444] rounded-lg bg-white dark:bg-[#161616] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all"
                            />
                        </div>

                        {/* Reset Button */}
                        <div className="flex items-end self-stretch">
                            <button
                                onClick={() => {
                                    setSelectedIndustry('All');
                                    setMinRating(undefined);
                                    setHasOffer(undefined);
                                    setPosition('');
                                    setSearchQuery('');
                                    setCurrentPage(1);
                                }}
                                className="text-[12px] font-bold text-maceng-orange hover:text-maceng-maroon transition-colors mb-2"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {activeTab === 'companies' ? (
                <>
                    {/* Share Button */}
                    <div className="flex justify-start mb-4">
                        <Link
                            to="/submit"
                            className="px-4 py-2 bg-maceng-maroon dark:bg-maceng-orange text-white text-sm font-medium rounded-lg hover:bg-maceng-maroon/90 transition-colors inline-flex items-center gap-1.5"
                        >
                            + Share an Interview Experience
                        </Link>
                    </div>
                    {/* Company List Content */}
                    {error ? (
                        <div className="text-center py-12 text-red-600 italic">
                            Failed to load companies. Please try again later.
                        </div>
                    ) : isLoading ? (
                        <div className="mb-8">
                            <CompanyListSkeleton />
                        </div>
                    ) : (
                        <>
                            {/* Company List Table */}
                            <div className="mb-8 overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-maceng-maroon/20 dark:border-maceng-maroon/40">
                                            <th className="text-left py-3 pr-4 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[15px] md:text-[16px] uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="hidden md:table-cell text-left py-3 pr-6 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[16px] uppercase tracking-wider">
                                                Industry
                                            </th>
                                            <th className="text-right md:text-center py-3 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[15px] md:text-[16px] uppercase tracking-wider w-24 md:w-32">
                                                Experiences
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                                        {paginatedCompanies.map((company: Company, index: number) => (
                                            <tr
                                                key={`${company.id}-${searchQuery}-${safePage}`}
                                                className="group hover:bg-[#fafafa] dark:hover:bg-[#222222] transition-all cursor-pointer animate-row-in"
                                                style={{ animationDelay: `${index * 30}ms` }}
                                                onClick={() => handleCompanyClick(company.id)}
                                            >
                                                <td className="py-3 pr-4 transition-transform group-hover:translate-x-1 duration-200">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[#333] dark:text-white group-hover:text-maceng-orange transition-colors">
                                                            {company.name}
                                                        </span>
                                                        <span className="md:hidden text-[#888] dark:text-[#b8b8b8] text-[11px] italic font-inter mt-0.5 line-clamp-1">
                                                            {company.industries.join(', ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-3 pr-6 text-[#777] dark:text-[#cccccc] text-sm italic font-inter leading-tight">
                                                    {company.industries.join(', ')}
                                                </td>
                                                <td className="py-3 text-right md:text-center">
                                                    {company.experience_count > 0 ? (
                                                        <span className="font-bold text-maceng-maroon dark:text-maceng-orange text-[15px]">
                                                            {company.experience_count}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#bbb] dark:text-[#b0b0b0]">—</span>
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
                                <div className="flex items-center justify-center gap-1 md:gap-1.5 mt-4 flex-wrap">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-[#eee] dark:border-[#444] text-[#777] dark:text-[#e5e5e5] hover:bg-[#fafafa] dark:hover:bg-[#222222] hover:border-[#ddd] dark:hover:border-[#666] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border text-xs md:text-sm font-semibold transition-all ${page === safePage
                                                ? 'bg-maceng-maroon dark:bg-maceng-orange text-white border-maceng-maroon dark:border-maceng-orange shadow-md shadow-maceng-maroon/20 dark:shadow-maceng-orange/20'
                                                : 'border-[#eee] dark:border-[#444] text-[#777] dark:text-[#e5e5e5] hover:bg-[#fafafa] dark:hover:bg-[#222222] hover:border-[#ddd] dark:hover:border-[#666]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#eee] dark:border-[#444] text-[#777] dark:text-[#e5e5e5] hover:bg-[#fafafa] dark:hover:bg-[#222222] hover:border-[#ddd] dark:hover:border-[#666] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    {/* Share Button */}
                    <div className="flex justify-start mb-4">
                        <Link
                            to="/submit-design-team"
                            className="px-4 py-2 bg-maceng-maroon dark:bg-maceng-orange text-white text-sm font-medium rounded-lg hover:bg-maceng-maroon/90 transition-colors inline-flex items-center gap-1.5"
                        >
                            + Share an Application Experience
                        </Link>
                    </div>
                    {/* Design Teams Content */}
                    {teamsError ? (
                        <div className="text-center py-12 text-red-600 italic">
                            Failed to load design teams. Please try again later.
                        </div>
                    ) : teamsLoading ? (
                        <div className="mb-8">
                            <CompanyListSkeleton />
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-maceng-maroon/20 dark:border-maceng-maroon/40">
                                            <th className="text-left py-3 pr-4 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[15px] md:text-[16px] uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="hidden md:table-cell text-left py-3 pr-6 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[16px] uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="text-right md:text-center py-3 font-playfair italic text-maceng-maroon dark:text-maceng-orange font-semibold text-[15px] md:text-[16px] uppercase tracking-wider w-24 md:w-32">
                                                Experiences
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                                        {filteredTeams.map((team: DesignTeam, index: number) => (
                                            <tr
                                                key={team.id}
                                                className="group hover:bg-[#fafafa] dark:hover:bg-[#222222] transition-all cursor-pointer animate-row-in"
                                                style={{ animationDelay: `${index * 30}ms` }}
                                                onClick={() => handleTeamClick(team.id)}
                                            >
                                                <td className="py-3 pr-4 transition-transform group-hover:translate-x-1 duration-200">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[#333] dark:text-white group-hover:text-maceng-orange transition-colors">
                                                            {team.name}
                                                        </span>
                                                        <span className="md:hidden text-[#888] dark:text-[#b8b8b8] text-[11px] italic font-inter mt-0.5 line-clamp-1">
                                                            {team.categories.join(', ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-3 pr-6 text-[#777] dark:text-[#cccccc] text-sm italic font-inter leading-tight">
                                                    {team.categories.join(', ')}
                                                </td>
                                                <td className="py-3 text-right md:text-center">
                                                    {team.review_count > 0 ? (
                                                        <span className="font-bold text-maceng-maroon dark:text-maceng-orange text-[15px]">
                                                            {team.review_count}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#bbb] dark:text-[#b0b0b0]">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredTeams.length === 0 && (
                                <div className="text-center py-12 text-[#666] italic">
                                    No design teams found matching your search.
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] dark:border-[#444] text-[13px] text-[#666] dark:text-[#d4d4d4]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
