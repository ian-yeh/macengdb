import React, { useState } from 'react';
import { type DesignTeam } from '../../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { deleteDesignTeam } from '../../api/api';
import AdminEditTeamModal from './AdminEditTeamModal';

interface ManageDesignTeamsTabProps {
    teams: DesignTeam[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function ManageDesignTeamsTab({
    teams,
    adminKey,
    showFeedback,
    startProcessing,
    stopProcessing,
    processing
}: ManageDesignTeamsTabProps) {
    const queryClient = useQueryClient();
    const [selectedTeam, setSelectedTeam] = useState<DesignTeam | null>(null);

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to permanently delete ${name}? This will delete all associated reviews.`)) return;
        
        const key = `manage-team-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        
        try {
            await deleteDesignTeam(id, adminKey);
            showFeedback(key, 'Design team deleted successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch {
            showFeedback(key, 'Failed to delete team', 'error');
        } finally {
            stopProcessing(key);
        }
    };

    if (teams.length === 0) return <p className="text-[#888] italic py-8">No design teams found.</p>;

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-[#fafafa] dark:bg-[#111] border-b border-[#eee] dark:border-[#333]">
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Name</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Categories</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Review Count</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                    {teams.map(team => (
                        <tr 
                            key={team.id} 
                            onClick={() => setSelectedTeam(team)}
                            className="hover:bg-[#fafafa] dark:hover:bg-[#111] transition-colors group cursor-pointer"
                        >
                            <td className="px-6 py-4">
                                <span className="font-bold dark:text-white capitalize group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors">
                                    {team.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-[#666] dark:text-[#a0a0a0]">
                                {team.categories.join(', ')}
                            </td>
                            <td className="px-6 py-4 text-[#666] dark:text-[#a0a0a0]">
                                {team.review_count}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={(e) => handleDelete(e, team.id, team.name)}
                                    className="text-red-500 hover:text-red-600 font-bold uppercase text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedTeam && (
                <AdminEditTeamModal 
                    team={selectedTeam}
                    adminKey={adminKey}
                    onClose={() => setSelectedTeam(null)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin'] });
                        queryClient.invalidateQueries({ queryKey: ['design-teams'] });
                    }}
                    showFeedback={(msg, type) => showFeedback(`edit-team-${selectedTeam.id}`, msg, type)}
                />
            )}
        </div>
    );
}
