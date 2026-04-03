import { type DesignTeamReview } from '../../api/types';
import { approveDesignTeamReview, rejectDesignTeamReview, deleteDesignTeamReview } from '../../api/api';
import { useQueryClient } from '@tanstack/react-query';

interface DesignTeamExperiencesTabProps {
    reviews: DesignTeamReview[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function DesignTeamExperiencesTab({ 
    reviews, 
    adminKey, 
    showFeedback, 
    startProcessing, 
    stopProcessing, 
    processing 
}: DesignTeamExperiencesTabProps) {
    const queryClient = useQueryClient();

    const handleApprove = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await approveDesignTeamReview(id, adminKey);
            showFeedback(key, 'Review approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
            queryClient.invalidateQueries({ queryKey: ['design-team-reviews'] });
        } catch { showFeedback(key, 'Failed to approve', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleReject = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await rejectDesignTeamReview(id, adminKey);
            showFeedback(key, 'Rejected review', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to reject', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleDelete = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await deleteDesignTeamReview(id, adminKey);
            showFeedback(key, 'Deleted review', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch { showFeedback(key, 'Failed to delete', 'error'); }
        finally { stopProcessing(key); }
    };

    if (reviews.length === 0) return <p className="text-[#888] italic py-8">No pending DT experience submissions.</p>;

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden animate-fade-up">
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">{review.position}</h3>
                                <p className="text-sm text-maceng-maroon dark:text-maceng-orange font-bold uppercase tracking-widest">
                                    {review.design_team_name || `Team ID: ${review.design_team_id}`} · {review.term}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleApprove(review.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition-colors">Approve</button>
                                <button onClick={() => handleReject(review.id)} className="bg-[#eee] dark:bg-[#333] text-[#666] dark:text-[#a0a0a0] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#e5e5e5] transition-colors">Reject</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Submitter</p>
                                    <p className="dark:text-white font-medium">{review.submitter_email}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="bg-[#f0f0f0] dark:bg-[#0f0f0f] px-2 py-1 rounded text-[10px] font-bold">Difficulty: {review.difficulty}/5</span>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${review.accepted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {review.accepted ? 'Joined' : 'Not Joined'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Recruitment Acquisition</p>
                                <p className="dark:text-white">{review.interview_acquisition || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="bg-[#fafafa] dark:bg-[#0f0f0f] p-4 rounded-xl border border-[#eee] dark:border-[#333] space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Process Description</p>
                                <p className="text-sm dark:text-white">{review.description || 'No description provided.'}</p>
                            </div>
                            {review.tips && (
                                <div>
                                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Tips & Advice</p>
                                    <p className="text-sm dark:text-white italic">"{review.tips}"</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-[#eee] dark:border-[#333]">
                            <button onClick={() => handleDelete(review.id)} className="text-red-500 font-bold uppercase text-[10px] hover:underline">Delete Permanently</button>
                            {processing.has(`dt-${review.id}`) && <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Processing...</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
