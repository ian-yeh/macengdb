import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type DesignTeam } from '../api/types';
import { useQuery } from '@tanstack/react-query';
import { fetchDesignTeams } from '../api/api';
import CompanyListSkeleton from '../components/CompanyListSkeleton';
import TabNav from '../components/TabNav';

export default function DesignTeamsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: teams = [], isLoading, error } = useQuery({
        queryKey: ['design-teams'],
        queryFn: () => fetchDesignTeams(),
    });

    const filteredTeams = teams.filter((team: DesignTeam) => {
        const q = searchQuery.toLowerCase();
        return (
            team.name.toLowerCase().includes(q) ||
            team.categories.some(c => c.toLowerCase().includes(q)) ||
            (team.description && team.description.toLowerCase().includes(q))
        );
    });

    const handleTeamClick = (teamId: number) => {
        navigate(`/design-teams/${teamId}`);
    };

    return (
        <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-2">
                <h1 className="font-playfair text-4xl font-bold text-maceng-maroon mb-6 tracking-tight">
                    MacEngDB
                </h1>
            </header>

            <TabNav />

            {/* Description */}
            <div className="mb-8">
                <p className="text-[16px] leading-relaxed text-[#333]">
                    Explore McMaster Engineering's design teams. Read reviews from past members and learn about the experience.
                </p>
            </div>

            {/* Search */}
            <div className="mb-10 flex gap-3">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb] text-lg">⌕</span>
                    <input
                        type="text"
                        placeholder="Search team or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[#ddd] rounded-xl text-[15px] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 focus:border-maceng-maroon/40 transition-all bg-white/80"
                    />
                </div>
            </div>

            {/* Team List */}
            {error ? (
                <div className="text-center py-12 text-red-600 italic">
                    Failed to load design teams. Please try again later.
                </div>
            ) : isLoading ? (
                <div className="mb-8">
                    <CompanyListSkeleton />
                </div>
            ) : (
                <>
                    <div className="mb-8 overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-maceng-maroon/20">
                                    <th className="text-left py-3 pr-4 font-playfair italic text-maceng-maroon font-semibold text-[15px] md:text-[16px] uppercase tracking-wider">
                                        Team
                                    </th>
                                    <th className="hidden md:table-cell text-left py-3 pr-6 font-playfair italic text-maceng-maroon font-semibold text-[16px] uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="text-right md:text-center py-3 font-playfair italic text-maceng-maroon font-semibold text-[15px] md:text-[16px] uppercase tracking-wider w-24 md:w-32">
                                        Reviews
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eee]">
                                {filteredTeams.map((team: DesignTeam, index: number) => (
                                    <tr
                                        key={team.id}
                                        className="group hover:bg-[#fafafa] transition-all cursor-pointer animate-row-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        onClick={() => handleTeamClick(team.id)}
                                    >
                                        <td className="py-3 pr-4 transition-transform group-hover:translate-x-1 duration-200">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[#333] group-hover:text-maceng-orange transition-colors">
                                                    {team.name}
                                                </span>
                                                <span className="md:hidden text-[#888] text-[11px] italic font-inter mt-0.5 line-clamp-1">
                                                    {team.categories.join(', ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell py-3 pr-6 text-[#777] text-sm italic font-inter leading-tight">
                                            {team.categories.join(', ')}
                                        </td>
                                        <td className="py-3 text-right md:text-center">
                                            {team.review_count > 0 ? (
                                                <span className="font-bold text-maceng-maroon text-[15px]">
                                                    {team.review_count}
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

                    {filteredTeams.length === 0 && (
                        <div className="text-center py-12 text-[#666] italic">
                            No design teams found matching your search.
                        </div>
                    )}
                </>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#eee] text-center">
                <p className="text-[12px] text-[#aaa] italic font-inter">
                    MacEngDB — Built by McMaster Engineering students, for McMaster Engineering students.
                </p>
            </footer>
        </div>
    );
}
