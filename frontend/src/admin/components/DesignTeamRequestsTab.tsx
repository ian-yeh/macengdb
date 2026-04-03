import { useState } from 'react';
import { type DesignTeamRequest } from '../../api/types';
import { approveDesignTeamRequest, rejectDesignTeamRequest, updateDesignTeamRequest, bulkDeleteDesignTeamRequests } from '../../api/api';
import { useQueryClient } from '@tanstack/react-query';

interface DesignTeamRequestsTabProps {
    requests: DesignTeamRequest[];
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function DesignTeamRequestsTab({ 
    requests, 
    adminKey, 
    showFeedback, 
    startProcessing, 
    stopProcessing, 
    processing 
}: DesignTeamRequestsTabProps) {
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [dtCategories, setDtCategories] = useState<Record<number, string>>({});
    const [editingRequest, setEditingRequest] = useState<number | null>(null);
    const [editedNames, setEditedNames] = useState<Record<number, string>>({});

    const handleApprove = async (id: number) => {
        const key = `dtreq-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            const categories = dtCategories[id]
                ? dtCategories[id].split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await approveDesignTeamRequest(id, adminKey, categories);
            showFeedback(key, 'Design team approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch { showFeedback(key, 'Failed to approve', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleReject = async (id: number) => {
        const key = `dtreq-${id}`;
        if (processing.has(key)) return;
        startProcessing(key);
        try {
            await rejectDesignTeamRequest(id, adminKey);
            showFeedback(key, 'Rejected request', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to reject', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleUpdateName = async (id: number) => {
        const key = `dtreq-${id}`;
        const newName = editedNames[id]?.trim();
        if (!newName || processing.has(key)) return;
        startProcessing(key);
        try {
            await updateDesignTeamRequest(id, adminKey, newName);
            showFeedback(key, 'Name updated!', 'success');
            setEditingRequest(null);
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to update', 'error'); }
        finally { stopProcessing(key); }
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0 || processing.has('bulk-dtreq')) return;
        startProcessing('bulk-dtreq');
        try {
            await bulkDeleteDesignTeamRequests(Array.from(selectedIds), adminKey);
            showFeedback('bulk-dtreq', `Rejected ${selectedIds.size} requests`, 'success');
            setSelectedIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback('bulk-dtreq', 'Failed to bulk reject', 'error'); }
        finally { stopProcessing('bulk-dtreq'); }
    };

    if (requests.length === 0) return <p className="text-[#888] italic py-8">No pending design team requests.</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[#eee] dark:border-[#333] pb-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedIds(selectedIds.size === requests.length ? new Set() : new Set(requests.map(r => r.id)))}
                        className="text-xs font-bold uppercase tracking-widest text-maceng-maroon dark:text-maceng-orange"
                    >
                        {selectedIds.size === requests.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-[10px] bg-[#eee] dark:bg-[#333] px-2 py-0.5 rounded font-bold">{selectedIds.size} selected</span>
                </div>
                {selectedIds.size > 0 && (
                    <button 
                        onClick={handleBulkReject}
                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                        Reject Selected
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-2xl overflow-hidden animate-fade-up">
                        <div className="p-6 flex items-start gap-4">
                            <input 
                                type="checkbox"
                                checked={selectedIds.has(req.id)}
                                onChange={() => {
                                    const next = new Set(selectedIds);
                                    if (next.has(req.id)) next.delete(req.id);
                                    else next.add(req.id);
                                    setSelectedIds(next);
                                }}
                                className="mt-1.5 h-4 w-4 rounded border-gray-300 text-maceng-orange focus:ring-maceng-orange"
                            />
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        {editingRequest === req.id ? (
                                            <div className="flex gap-2">
                                                <input 
                                                    autoFocus
                                                    value={editedNames[req.id] ?? req.name}
                                                    onChange={(e) => setEditedNames({ ...editedNames, [req.id]: e.target.value })}
                                                    className="flex-1 bg-transparent border-b border-maceng-orange py-1 text-xl font-bold dark:text-white outline-none"
                                                />
                                                <button onClick={() => handleUpdateName(req.id)} className="text-green-500 font-bold uppercase text-[10px]">Save</button>
                                                <button onClick={() => setEditingRequest(null)} className="text-[#999] font-bold uppercase text-[10px]">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold dark:text-white">{req.name}</h3>
                                                <button onClick={() => setEditingRequest(req.id)} className="text-[#999] hover:text-maceng-orange transition-colors">✎</button>
                                            </div>
                                        )}
                                        <p className="text-xs text-[#999] font-bold uppercase tracking-widest mt-1">Requested by: {req.requester_email || 'Anonymous'}</p>
                                    </div>
                                    <button onClick={() => handleReject(req.id)} className="text-xs font-bold uppercase tracking-widest text-[#999] hover:text-red-500 transition-colors">Reject</button>
                                </div>

                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Categories (Comma Separated)</label>
                                        <input 
                                            value={dtCategories[req.id] || ''}
                                            onChange={(e) => setDtCategories({ ...dtCategories, [req.id]: e.target.value })}
                                            placeholder="e.g. Robotics, Software, Formula SAE..."
                                            className="w-full bg-[#fafafa] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#333] rounded-lg p-3 text-sm focus:border-maceng-orange outline-none dark:text-white"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleApprove(req.id)}
                                        className="bg-maceng-maroon dark:bg-maceng-orange text-white px-6 py-3 rounded-lg font-bold text-sm hover:scale-[1.02] transition-all"
                                    >
                                        Approve & Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
