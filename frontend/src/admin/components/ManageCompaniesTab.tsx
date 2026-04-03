import React, { useState } from 'react';
import { type Company } from '../../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { deleteCompany } from '../../api/api';
import AdminEditCompanyModal from './AdminEditCompanyModal';

interface ManageCompaniesTabProps {
    companies: Company[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function ManageCompaniesTab({
    companies,
    adminKey,
    showFeedback,
    startProcessing,
    stopProcessing,
    processing
}: ManageCompaniesTabProps) {
    const queryClient = useQueryClient();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation(); // Don't trigger the row click
        if (!window.confirm(`Are you sure you want to permanently delete ${name}? This will delete all associated experiences.`)) return;
        
        const key = `manage-comp-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        
        try {
            await deleteCompany(id, adminKey);
            showFeedback(key, 'Company deleted successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch {
            showFeedback(key, 'Failed to delete company', 'error');
        } finally {
            stopProcessing(key);
        }
    };

    if (companies.length === 0) return <p className="text-[#888] italic py-8">No companies found.</p>;

    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-[#fafafa] dark:bg-[#111] border-b border-[#eee] dark:border-[#333]">
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Name</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Industry</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999]">Experiences</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-[#999] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                    {companies.map(company => (
                        <tr 
                            key={company.id} 
                            onClick={() => setSelectedCompany(company)}
                            className="hover:bg-[#fafafa] dark:hover:bg-[#111] transition-colors group cursor-pointer"
                        >
                            <td className="px-6 py-4">
                                <span className="font-bold dark:text-white capitalize group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors">
                                    {company.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-[#666] dark:text-[#a0a0a0]">
                                {company.industries.join(', ')}
                            </td>
                            <td className="px-6 py-4 text-[#666] dark:text-[#a0a0a0]">
                                {company.experience_count}
                            </td>
                            <td className="px-6 py-4 text-right transition-all">
                                <button 
                                    onClick={(e) => handleDelete(e, company.id, company.name)}
                                    className="text-red-500 hover:text-red-600 font-bold uppercase text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCompany && (
                <AdminEditCompanyModal 
                    company={selectedCompany}
                    adminKey={adminKey}
                    onClose={() => setSelectedCompany(null)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin'] });
                        queryClient.invalidateQueries({ queryKey: ['companies'] });
                    }}
                    showFeedback={(msg, type) => showFeedback(`edit-comp-${selectedCompany.id}`, msg, type)}
                />
            )}
        </div>
    );
}
