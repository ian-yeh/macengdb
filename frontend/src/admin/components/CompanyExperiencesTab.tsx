import { type Experience } from '../../api/types';
import { approveExperience, rejectExperience, deleteExperience } from '../../api/api';
import { useQueryClient } from '@tanstack/react-query';

interface CompanyExperiencesTabProps {
    experiences: Experience[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function CompanyExperiencesTab({ 
    experiences, 
    adminKey, 
    showFeedback, 
    startProcessing, 
    stopProcessing, 
    processing 
}: CompanyExperiencesTabProps) {
    const queryClient = useQueryClient();

    const handleApprove = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await approveExperience(id, adminKey);
            showFeedback(key, 'Experience approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        } catch { showFeedback(key, 'Failed to approve', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleReject = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await rejectExperience(id, adminKey);
            showFeedback(key, 'Rejected experience', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to reject', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleDelete = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await deleteExperience(id, adminKey);
            showFeedback(key, 'Deleted experience', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback(key, 'Failed to delete', 'error'); }
        finally { stopProcessing(key); }
    };

    if (experiences.length === 0) return <p className="text-[#888] italic py-8">No pending company experience submissions.</p>;

    return (
        <div className="space-y-6">
            {experiences.map(exp => (
                <div key={exp.id} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden animate-fade-up">
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">{exp.position}</h3>
                                <p className="text-sm text-maceng-maroon dark:text-maceng-orange font-bold uppercase tracking-widest">
                                    {exp.new_company_name || `Company ID: ${exp.company_id}`} · {exp.term}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleApprove(exp.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition-colors">Approve</button>
                                <button onClick={() => handleReject(exp.id)} className="bg-[#eee] dark:bg-[#333] text-[#666] dark:text-[#a0a0a0] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#e5e5e5] transition-colors">Reject</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Submitter</p>
                                    <p className="dark:text-white font-medium">{exp.submitter_email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Details</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-[#f0f0f0] dark:bg-[#0f0f0f] px-2 py-1 rounded text-[10px] font-bold">Difficulty: {exp.difficulty}/5</span>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${exp.offer_received ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {exp.offer_received ? 'Offer' : 'No Offer'}
                                        </span>
                                        {exp.interview_acquisition && (
                                            <span className="bg-maceng-orange/10 text-maceng-orange px-2 py-1 rounded text-[10px] font-bold">{exp.interview_acquisition}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {exp.stages && exp.stages.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">Interview Stages</p>
                                        <div className="space-y-2">
                                            {exp.stages.map((stage, i) => (
                                                <div key={i} className="text-xs border-l-2 border-[#eee] dark:border-[#333] pl-3 py-1">
                                                    <p className="font-bold dark:text-white">{stage.name} {stage.duration && <span className="text-[#999] font-normal">({stage.duration})</span>}</p>
                                                    <p className="text-[#666] dark:text-[#888]">{stage.questions.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {exp.tips && (
                            <div className="bg-[#fafafa] dark:bg-[#0f0f0f] p-4 rounded-xl border border-[#eee] dark:border-[#333]">
                                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Tips & Advice</p>
                                <p className="text-sm dark:text-white italic">"{exp.tips}"</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-[#eee] dark:border-[#333]">
                            <button onClick={() => handleDelete(exp.id)} className="text-red-500 font-bold uppercase text-[10px] hover:underline">Delete Permanently</button>
                            {processing.has(`exp-${exp.id}`) && <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Processing...</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
