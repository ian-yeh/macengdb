import React, { useState } from 'react';
import { type Experience, type DesignTeamReview } from '../../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { deleteExperience, deleteDesignTeamReview } from '../../api/api';
import AdminEditExperienceModal from './AdminEditExperienceModal';

interface ManageExperiencesTabProps {
    experiences: Experience[];
    reviews: DesignTeamReview[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function ManageExperiencesTab({
    experiences,
    reviews,
    adminKey,
    showFeedback,
    startProcessing,
    stopProcessing,
    processing
}: ManageExperiencesTabProps) {
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<Experience | DesignTeamReview | null>(null);
    const [selectedType, setSelectedType] = useState<'company' | 'dt'>('company');

    const handleDeleteExp = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this experience?')) return;
        const key = `manage-exp-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await deleteExperience(id, adminKey);
            showFeedback(key, 'Experience deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to delete', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleDeleteReview = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        const key = `manage-rvw-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await deleteDesignTeamReview(id, adminKey);
            showFeedback(key, 'Review deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to delete', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleRowClick = (item: Experience | DesignTeamReview, type: 'company' | 'dt') => {
        setSelectedItem(item);
        setSelectedType(type);
    };

    return (
        <div className="space-y-12">
            {/* Company Experiences */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#999] px-2">Company Experiences ({experiences.length})</h2>
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[#fafafa] dark:bg-[#111] border-b border-[#eee] dark:border-[#333]">
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">COMPANY</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">POSITION</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">TERM</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">SUBMITTER</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999] text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                            {experiences.map(exp => (
                                <tr 
                                    key={exp.id} 
                                    onClick={() => handleRowClick(exp, 'company')}
                                    className="hover:bg-[#fafafa] dark:hover:bg-[#111] transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-bold dark:text-white capitalize text-xs">
                                        <div className="group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors">
                                            {exp.company_name || exp.new_company_name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs dark:text-white">{exp.position}</td>
                                    <td className="px-6 py-4 text-xs text-[#666] dark:text-[#a0a0a0]">{exp.term}</td>
                                    <td className="px-6 py-4 text-[10px] text-[#999] font-bold">{exp.submitter_email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => handleDeleteExp(e, exp.id)} 
                                            className="text-red-500 hover:text-red-600 font-bold uppercase text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* DT Reviews */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#999] px-2">Design Team Reviews ({reviews.length})</h2>
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[#fafafa] dark:bg-[#111] border-b border-[#eee] dark:border-[#333]">
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">TEAM</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">POSITION</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">TERM</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999]">SUBMITTER</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-[10px] text-[#999] text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                            {reviews.map(rvw => (
                                <tr 
                                    key={rvw.id} 
                                    onClick={() => handleRowClick(rvw, 'dt')}
                                    className="hover:bg-[#fafafa] dark:hover:bg-[#111] transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-bold dark:text-white capitalize text-xs">
                                        <div className="group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors">
                                            {rvw.design_team_name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs dark:text-white">{rvw.position}</td>
                                    <td className="px-6 py-4 text-xs text-[#666] dark:text-[#a0a0a0]">{rvw.term}</td>
                                    <td className="px-6 py-4 text-[10px] text-[#999] font-bold">{rvw.submitter_email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => handleDeleteReview(e, rvw.id)} 
                                            className="text-red-500 hover:text-red-600 font-bold uppercase text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedItem && (
                <AdminEditExperienceModal 
                    item={selectedItem}
                    type={selectedType}
                    adminKey={adminKey}
                    onClose={() => setSelectedItem(null)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin'] });
                    }}
                    showFeedback={(msg, type) => showFeedback(`edit-exp-${selectedItem.id}`, msg, type)}
                />
            )}
        </div>
    );
}
