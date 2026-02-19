import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchPendingExperiences, approveExperience, rejectExperience, deleteExperience,
    fetchPendingCompanyRequests, approveCompanyRequest, rejectCompanyRequest, updateCompanyRequest,
    fetchPendingDesignTeamReviews, approveDesignTeamReview, rejectDesignTeamReview, deleteDesignTeamReview,
    fetchPendingDesignTeamRequests, approveDesignTeamRequest, rejectDesignTeamRequest, updateDesignTeamRequest,
    adminCreateCompany, bulkDeleteCompanyRequests, bulkDeleteDesignTeamRequests
} from '../api/api';
import { type Experience, type CompanyRequest, type DesignTeamReview, type DesignTeamRequest } from '../api/types';
import Loader from '../components/Loader';

type AdminTab = 'requests' | 'dt-requests' | 'company-exp' | 'dt-exp' | 'create';

export default function AdminPage() {
    const queryClient = useQueryClient();
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
    const [keyInput, setKeyInput] = useState('');
    const [authenticated, setAuthenticated] = useState(() => !!sessionStorage.getItem('adminKey'));
    const [authError, setAuthError] = useState('');
    const [feedback, setFeedback] = useState<{ key: string; message: string; type: 'success' | 'error' } | null>(null);
    const [processing, setProcessing] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<AdminTab>('requests');
    const [selectedCompanyReqIds, setSelectedCompanyReqIds] = useState<Set<number>>(new Set());
    const [selectedDTReqIds, setSelectedDTReqIds] = useState<Set<number>>(new Set());

    // Queries
    const { data: pendingExperiences = [], isLoading: expLoading } = useQuery({
        queryKey: ['admin', 'pending-experiences'],
        queryFn: () => fetchPendingExperiences(adminKey),
        enabled: authenticated,
        retry: false,
    });

    const { data: pendingRequests = [], isLoading: reqLoading } = useQuery({
        queryKey: ['admin', 'pending-requests'],
        queryFn: () => fetchPendingCompanyRequests(adminKey),
        enabled: authenticated,
        retry: false,
    });

    const { data: pendingDTReviews = [], isLoading: dtLoading } = useQuery({
        queryKey: ['admin', 'pending-dt-reviews'],
        queryFn: () => fetchPendingDesignTeamReviews(adminKey),
        enabled: authenticated,
        retry: false,
    });

    const { data: pendingDTRequests = [], isLoading: dtReqLoading } = useQuery({
        queryKey: ['admin', 'pending-dt-requests'],
        queryFn: () => fetchPendingDesignTeamRequests(adminKey),
        enabled: authenticated,
        retry: false,
    });

    // Auth handlers
    const handleLogin = async () => {
        setAuthError('');
        try {
            await fetchPendingExperiences(keyInput);
            setAdminKey(keyInput);
            sessionStorage.setItem('adminKey', keyInput);
            setAuthenticated(true);
        } catch {
            setAuthError('Invalid admin key');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminKey');
        setAdminKey('');
        setAuthenticated(false);
        setKeyInput('');
    };

    const showFeedback = (key: string, message: string, type: 'success' | 'error') => {
        setFeedback({ key, message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    // --- Company Experience actions ---
    const handleApproveExp = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await approveExperience(id, adminKey);
            showFeedback(key, 'Approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleRejectExp = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await rejectExperience(id, adminKey);
            showFeedback(key, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleDeleteExp = async (id: number) => {
        const key = `exp-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await deleteExperience(id, adminKey);
            showFeedback(key, 'Deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    // --- Company Request actions ---
    const [requestIndustries, setRequestIndustries] = useState<Record<number, string>>({});
    const [editingRequest, setEditingRequest] = useState<number | null>(null);
    const [editedNames, setEditedNames] = useState<Record<number, string>>({});

    const handleApproveReq = async (id: number) => {
        const key = `req-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            const industries = requestIndustries[id]
                ? requestIndustries[id].split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await approveCompanyRequest(id, adminKey, industries);
            showFeedback(key, 'Company created!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleRejectReq = async (id: number) => {
        const key = `req-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await rejectCompanyRequest(id, adminKey);
            showFeedback(key, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleUpdateReqName = async (id: number) => {
        const key = `req-${id}`;
        const newName = editedNames[id]?.trim();
        if (!newName || processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await updateCompanyRequest(id, adminKey, newName);
            showFeedback(key, 'Name updated!', 'success');
            setEditingRequest(null);
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to update', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleBulkRejectReq = async () => {
        if (selectedCompanyReqIds.size === 0 || processing.has('bulk-req')) return;
        setProcessing(prev => new Set(prev).add('bulk-req'));
        try {
            await bulkDeleteCompanyRequests(Array.from(selectedCompanyReqIds), adminKey);
            showFeedback('bulk-req', `Rejected ${selectedCompanyReqIds.size} requests`, 'success');
            setSelectedCompanyReqIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback('bulk-req', 'Failed to bulk reject', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete('bulk-req'); return n; }); }
    };

    const toggleRequestSelection = (id: number) => {
        setSelectedCompanyReqIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // --- Design Team Review actions ---
    const handleApproveDT = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await approveDesignTeamReview(id, adminKey);
            showFeedback(key, 'Approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleRejectDT = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await rejectDesignTeamReview(id, adminKey);
            showFeedback(key, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleDeleteDT = async (id: number) => {
        const key = `dt-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await deleteDesignTeamReview(id, adminKey);
            showFeedback(key, 'Deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    // --- Design Team Request actions ---
    const [editingDTRequest, setEditingDTRequest] = useState<number | null>(null);
    const [editedDTNames, setEditedDTNames] = useState<Record<number, string>>({});
    const [dtRequestCategories, setDtRequestCategories] = useState<Record<number, string>>({});

    const handleApproveDTReq = async (id: number) => {
        const key = `dtreq-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            const categories = dtRequestCategories[id]
                ? dtRequestCategories[id].split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await approveDesignTeamRequest(id, adminKey, categories);
            showFeedback(key, 'Design team created!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleRejectDTReq = async (id: number) => {
        const key = `dtreq-${id}`;
        if (processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await rejectDesignTeamRequest(id, adminKey);
            showFeedback(key, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleUpdateDTReqName = async (id: number) => {
        const key = `dtreq-${id}`;
        const newName = editedDTNames[id]?.trim();
        if (!newName || processing.has(key)) return;
        setProcessing(prev => new Set(prev).add(key));
        try {
            await updateDesignTeamRequest(id, adminKey, newName);
            showFeedback(key, 'Name updated!', 'success');
            setEditingDTRequest(null);
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(key, 'Failed to update', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete(key); return n; }); }
    };

    const handleBulkRejectDTReq = async () => {
        if (selectedDTReqIds.size === 0 || processing.has('bulk-dtreq')) return;
        setProcessing(prev => new Set(prev).add('bulk-dtreq'));
        try {
            await bulkDeleteDesignTeamRequests(Array.from(selectedDTReqIds), adminKey);
            showFeedback('bulk-dtreq', `Rejected ${selectedDTReqIds.size} requests`, 'success');
            setSelectedDTReqIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback('bulk-dtreq', 'Failed to bulk reject', 'error'); }
        finally { setProcessing(prev => { const n = new Set(prev); n.delete('bulk-dtreq'); return n; }); }
    };

    const toggleDTRequestSelection = (id: number) => {
        setSelectedDTReqIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // --- Manual Company Creation ---
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyIndustries, setNewCompanyIndustries] = useState('');
    const [createStatus, setCreateStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) return;
        setCreateStatus('creating');
        try {
            const industries = newCompanyIndustries
                ? newCompanyIndustries.split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await adminCreateCompany(adminKey, newCompanyName.trim(), industries);
            setCreateStatus('success');
            setNewCompanyName('');
            setNewCompanyIndustries('');
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            setTimeout(() => setCreateStatus('idle'), 3000);
        } catch {
            setCreateStatus('error');
            setTimeout(() => setCreateStatus('idle'), 3000);
        }
    };

    // Login gate
    if (!authenticated) {
        return (
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-md mx-auto">
                <Link to="/" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm">
                    ← Back to home
                </Link>
                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    Admin Access
                </h1>
                <p className="text-[15px] text-[#555] mb-6">
                    Enter the admin key to review pending submissions.
                </p>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Admin key"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                    />
                    {authError && <p className="text-sm text-red-600">{authError}</p>}
                    <button
                        onClick={handleLogin}
                        className="w-full py-2.5 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors"
                    >
                        Enter
                    </button>
                </div>
            </div>
        );
    }

    if (expLoading || reqLoading || dtLoading || dtReqLoading) return <Loader message="Loading admin panel..." />;

    const tabs: { id: AdminTab; label: string; count: number }[] = [
        { id: 'requests', label: 'Company Requests', count: pendingRequests.length },
        { id: 'dt-requests', label: 'DT Requests', count: pendingDTRequests.length },
        { id: 'company-exp', label: 'Company Experiences', count: pendingExperiences.length },
        { id: 'dt-exp', label: 'DT Experiences', count: pendingDTReviews.length },
        { id: 'create', label: '+ Add Company', count: 0 },
    ];

    const totalPending = pendingExperiences.length + pendingRequests.length + pendingDTReviews.length + pendingDTRequests.length;

    return (
        <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-6xl mx-auto">
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm">
                        ← Back to home
                    </Link>
                    <button onClick={handleLogout} className="text-xs text-[#888] hover:text-maceng-maroon transition-colors cursor-pointer">
                        Logout
                    </button>
                </div>
                <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    Admin Panel
                </h1>
                <p className="text-[15px] text-[#555]">
                    <span className="font-medium text-maceng-maroon">{totalPending}</span> item{totalPending !== 1 ? 's' : ''} awaiting review
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Vertical Sidebar Navigation */}
                <nav className="w-full md:w-56 flex-shrink-0">
                    <div className="flex flex-col gap-1 md:sticky md:top-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center justify-between gap-2
                                    whitespace-nowrap md:whitespace-normal text-left
                                    px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-[13px] font-medium
                                    transition-all duration-150 cursor-pointer
                                    ${tab.id === activeTab
                                        ? 'bg-maceng-maroon text-white shadow-sm'
                                        : 'text-[#555] hover:bg-[#f5f5f5] hover:text-maceng-maroon'
                                    }
                                `}
                            >
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-[11px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full font-semibold ${tab.id === activeTab
                                        ? 'bg-white/25 text-white'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* ===== Company Requests Tab ===== */}
                    {activeTab === 'requests' && (
                        <section>
                            {pendingRequests.length === 0 ? (
                                <p className="text-sm text-[#888] italic py-4">No pending company requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-[#f8f8f8] p-3 rounded-lg border border-[#eee]">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    if (selectedCompanyReqIds.size === pendingRequests.length) setSelectedCompanyReqIds(new Set());
                                                    else setSelectedCompanyReqIds(new Set(pendingRequests.map((r: CompanyRequest) => r.id)));
                                                }}
                                                className="text-xs font-medium text-maceng-maroon hover:underline cursor-pointer"
                                            >
                                                {selectedCompanyReqIds.size === pendingRequests.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                            <span className="text-[11px] text-[#666]">
                                                {selectedCompanyReqIds.size} selected
                                            </span>
                                        </div>
                                        {selectedCompanyReqIds.size > 0 && (
                                            <button
                                                onClick={handleBulkRejectReq}
                                                disabled={processing.has('bulk-req')}
                                                className="px-3 py-1 bg-red-600 text-white text-[11px] font-semibold rounded hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                Reject {selectedCompanyReqIds.size} Selected
                                            </button>
                                        )}
                                    </div>
                                    {pendingRequests.map((req: CompanyRequest) => {
                                        const date = new Date(req.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        });
                                        return (
                                            <div key={req.id} className="flex flex-col border border-[#e5e5e5] rounded-lg bg-white overflow-hidden animate-row-in">
                                                <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[#f5f5f5]">
                                                    <div className="flex items-center self-start mt-1 mr-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCompanyReqIds.has(req.id)}
                                                            onChange={() => toggleRequestSelection(req.id)}
                                                            className="w-4 h-4 rounded border-[#ccc] text-maceng-maroon focus:ring-maceng-maroon cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {editingRequest === req.id ? (
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <input
                                                                        type="text"
                                                                        value={editedNames[req.id] ?? req.name}
                                                                        onChange={(e) => setEditedNames({ ...editedNames, [req.id]: e.target.value })}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateReqName(req.id); if (e.key === 'Escape') setEditingRequest(null); }}
                                                                        autoFocus
                                                                        className="flex-1 bg-white border border-maceng-maroon/30 rounded px-2.5 py-1 text-[15px] font-semibold text-[#222] focus:outline-none focus:border-maceng-maroon"
                                                                    />
                                                                    <button onClick={() => handleUpdateReqName(req.id)} disabled={processing.has(`req-${req.id}`)} className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50 cursor-pointer">Save</button>
                                                                    <button onClick={() => setEditingRequest(null)} className="text-xs text-[#888] hover:text-[#333] cursor-pointer">Cancel</button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="font-semibold text-[#222] text-[15px]">{req.name}</span>
                                                                    <button
                                                                        onClick={() => { setEditingRequest(req.id); setEditedNames({ ...editedNames, [req.id]: req.name }); }}
                                                                        className="text-[#bbb] hover:text-maceng-maroon transition-colors cursor-pointer"
                                                                        title="Edit name"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                            <span className="text-xs text-[#aaa]">{date}</span>
                                                        </div>
                                                        {req.requester_email && (
                                                            <div className="text-[11px] text-maceng-orange font-medium mt-0.5">
                                                                Requested by: {req.requester_email}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRejectReq(req.id)}
                                                        disabled={processing.has(`req-${req.id}`)}
                                                        className="px-3 py-1.5 text-[#888] text-xs font-medium hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-2"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                                <div className="bg-[#fafafa] px-4 md:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Industries (comma separated: Tech, Finance...)"
                                                            value={requestIndustries[req.id] || ''}
                                                            onChange={(e) => setRequestIndustries({ ...requestIndustries, [req.id]: e.target.value })}
                                                            className="w-full bg-white border border-[#ddd] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-maceng-maroon"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {feedback?.key === `req-${req.id}` && (
                                                            <span className={`text-xs ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {feedback.message}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleApproveReq(req.id)}
                                                            disabled={processing.has(`req-${req.id}`)}
                                                            className="px-4 py-1.5 bg-maceng-maroon text-white text-xs rounded font-medium hover:bg-maceng-maroon/90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            {processing.has(`req-${req.id}`) ? 'Processing...' : 'Approve & Create'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* ===== DT Requests Tab ===== */}
                    {activeTab === 'dt-requests' && (
                        <section>
                            {pendingDTRequests.length === 0 ? (
                                <p className="text-sm text-[#888] italic py-4">No pending design team requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-[#f8f8f8] p-3 rounded-lg border border-[#eee]">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    if (selectedDTReqIds.size === pendingDTRequests.length) setSelectedDTReqIds(new Set());
                                                    else setSelectedDTReqIds(new Set(pendingDTRequests.map((r: DesignTeamRequest) => r.id)));
                                                }}
                                                className="text-xs font-medium text-maceng-maroon hover:underline cursor-pointer"
                                            >
                                                {selectedDTReqIds.size === pendingDTRequests.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                            <span className="text-[11px] text-[#666]">
                                                {selectedDTReqIds.size} selected
                                            </span>
                                        </div>
                                        {selectedDTReqIds.size > 0 && (
                                            <button
                                                onClick={handleBulkRejectDTReq}
                                                disabled={processing.has('bulk-dtreq')}
                                                className="px-3 py-1 bg-red-600 text-white text-[11px] font-semibold rounded hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                Reject {selectedDTReqIds.size} Selected
                                            </button>
                                        )}
                                    </div>
                                    {pendingDTRequests.map((req: DesignTeamRequest) => {
                                        const date = new Date(req.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        });
                                        return (
                                            <div key={req.id} className="flex flex-col border border-[#e5e5e5] rounded-lg bg-white overflow-hidden animate-row-in">
                                                <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[#f5f5f5]">
                                                    <div className="flex items-center self-start mt-1 mr-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDTReqIds.has(req.id)}
                                                            onChange={() => toggleDTRequestSelection(req.id)}
                                                            className="w-4 h-4 rounded border-[#ccc] text-maceng-maroon focus:ring-maceng-maroon cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {editingDTRequest === req.id ? (
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <input
                                                                        type="text"
                                                                        value={editedDTNames[req.id] ?? req.name}
                                                                        onChange={(e) => setEditedDTNames({ ...editedDTNames, [req.id]: e.target.value })}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateDTReqName(req.id); if (e.key === 'Escape') setEditingDTRequest(null); }}
                                                                        autoFocus
                                                                        className="flex-1 bg-white border border-maceng-maroon/30 rounded px-2.5 py-1 text-[15px] font-semibold text-[#222] focus:outline-none focus:border-maceng-maroon"
                                                                    />
                                                                    <button onClick={() => handleUpdateDTReqName(req.id)} disabled={processing.has(`dtreq-${req.id}`)} className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50 cursor-pointer">Save</button>
                                                                    <button onClick={() => setEditingDTRequest(null)} className="text-xs text-[#888] hover:text-[#333] cursor-pointer">Cancel</button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="font-semibold text-[#222] text-[15px]">{req.name}</span>
                                                                    <button
                                                                        onClick={() => { setEditingDTRequest(req.id); setEditedDTNames({ ...editedDTNames, [req.id]: req.name }); }}
                                                                        className="text-[#bbb] hover:text-maceng-maroon transition-colors cursor-pointer"
                                                                        title="Edit name"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                            <span className="text-xs text-[#aaa]">{date}</span>
                                                        </div>
                                                        {req.requester_email && (
                                                            <div className="text-[11px] text-maceng-orange font-medium mt-0.5">
                                                                Requested by: {req.requester_email}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRejectDTReq(req.id)}
                                                        disabled={processing.has(`dtreq-${req.id}`)}
                                                        className="px-3 py-1.5 text-[#888] text-xs font-medium hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-2"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                                <div className="bg-[#fafafa] px-4 md:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Categories (comma separated: Robotics, Software...)"
                                                            value={dtRequestCategories[req.id] || ''}
                                                            onChange={(e) => setDtRequestCategories({ ...dtRequestCategories, [req.id]: e.target.value })}
                                                            className="w-full bg-white border border-[#ddd] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-maceng-maroon"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {feedback?.key === `dtreq-${req.id}` && (
                                                            <span className={`text-xs ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {feedback.message}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleApproveDTReq(req.id)}
                                                            disabled={processing.has(`dtreq-${req.id}`)}
                                                            className="px-4 py-1.5 bg-maceng-maroon text-white text-xs rounded font-medium hover:bg-maceng-maroon/90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            {processing.has(`dtreq-${req.id}`) ? 'Processing...' : 'Approve & Create'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* ===== Company Experiences Tab ===== */}
                    {activeTab === 'company-exp' && (
                        <section>
                            {pendingExperiences.length === 0 ? (
                                <p className="text-sm text-[#888] italic py-4">No pending company experience submissions.</p>
                            ) : (
                                <div className="space-y-6">
                                    {pendingExperiences.map((experience: Experience) => {
                                        const formattedDate = new Date(experience.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        });

                                        return (
                                            <article key={experience.id} className="border border-[#e5e5e5] rounded-lg p-4 md:p-6 bg-white animate-row-in">
                                                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                                    <div>
                                                        <h3 className="font-playfair text-lg text-[#222]">{experience.position}</h3>
                                                        <p className="text-sm text-[#888]">Company ID: {experience.company_id} · {experience.term}</p>
                                                    </div>
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">Pending</span>
                                                </div>

                                                <p className="text-xs text-[#999] mb-3">
                                                    Submitted by <span className="font-medium text-[#555]">{experience.submitter_email}</span> on {formattedDate}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                                                    <span className="px-2.5 py-1 rounded-full bg-maceng-maroon/10 text-maceng-maroon font-medium">
                                                        Difficulty: {experience.difficulty}/5
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full font-medium ${experience.offer_received ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {experience.offer_received ? '✓ Offer received' : '✗ No offer'}
                                                    </span>
                                                    {experience.interview_acquisition && (
                                                        <span className="px-2.5 py-1 rounded-full bg-maceng-orange/10 text-maceng-orange font-medium">
                                                            How: {experience.interview_acquisition}
                                                        </span>
                                                    )}
                                                </div>

                                                {experience.stages && experience.stages.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-[11px] uppercase tracking-widest text-[#999] font-semibold mb-2">Interview Stages</p>
                                                        <div className="space-y-1.5">
                                                            {experience.stages.map((stage, i) => (
                                                                <div key={i} className="text-sm text-[#444] bg-[#fafafa] rounded px-3 py-2">
                                                                    <span className="font-medium">{stage.name}</span>
                                                                    {stage.duration && <span className="text-[#999] ml-1">({stage.duration})</span>}
                                                                    {stage.questions.length > 0 && (
                                                                        <ul className="mt-1 ml-4 space-y-0.5 text-[#555]">
                                                                            {stage.questions.map((q, j) => (
                                                                                <li key={j} className="before:content-['–'] before:mr-2 before:text-[#ccc]">{q}</li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {experience.tips && (
                                                    <div className="bg-[#fffbf5] border-l-3 border-maceng-orange/40 rounded-r px-4 py-3 mb-4">
                                                        <p className="text-[11px] uppercase tracking-widest text-maceng-orange/70 font-semibold mb-1">Tips</p>
                                                        <p className="text-sm text-[#444]">{experience.tips}</p>
                                                    </div>
                                                )}

                                                {feedback?.key === `exp-${experience.id}` && (
                                                    <p className={`text-sm mb-3 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {feedback.message}
                                                    </p>
                                                )}

                                                <div className="flex gap-2 sm:gap-3 pt-3 border-t border-[#f0f0f0]">
                                                    <button
                                                        onClick={() => handleApproveExp(experience.id)}
                                                        disabled={processing.has(`exp-${experience.id}`)}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {processing.has(`exp-${experience.id}`) ? '...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectExp(experience.id)}
                                                        disabled={processing.has(`exp-${experience.id}`)}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#f0f0f0] text-[#666] text-xs sm:text-sm rounded font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExp(experience.id)}
                                                        disabled={processing.has(`exp-${experience.id}`)}
                                                        className="px-3 sm:px-4 py-2 text-red-500 text-xs sm:text-sm font-medium hover:text-red-700 hover:bg-red-50 rounded transition-colors sm:ml-auto disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* ===== Design Team Experiences Tab ===== */}
                    {activeTab === 'dt-exp' && (
                        <section>
                            {pendingDTReviews.length === 0 ? (
                                <p className="text-sm text-[#888] italic py-4">No pending design team experience submissions.</p>
                            ) : (
                                <div className="space-y-6">
                                    {pendingDTReviews.map((review: DesignTeamReview) => {
                                        const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        });

                                        return (
                                            <article key={review.id} className="border border-[#e5e5e5] rounded-lg p-4 md:p-6 bg-white animate-row-in">
                                                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                                    <div>
                                                        <h3 className="font-playfair text-lg text-[#222]">{review.position}</h3>
                                                        <p className="text-sm text-[#888]">Team ID: {review.design_team_id} · {review.term}</p>
                                                    </div>
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">Pending</span>
                                                </div>

                                                <p className="text-xs text-[#999] mb-3">
                                                    Submitted by <span className="font-medium text-[#555]">{review.submitter_email}</span> on {formattedDate}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                                                    <span className="px-2.5 py-1 rounded-full bg-maceng-maroon/10 text-maceng-maroon font-medium">
                                                        Difficulty: {review.difficulty}/5
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full font-medium ${review.accepted ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {review.accepted ? '✓ Accepted' : '✗ Not accepted'}
                                                    </span>
                                                    {review.interview_acquisition && (
                                                        <span className="px-2.5 py-1 rounded-full bg-maceng-orange/10 text-maceng-orange font-medium">
                                                            Found via: {review.interview_acquisition}
                                                        </span>
                                                    )}
                                                </div>

                                                {review.description && (
                                                    <div className="mb-4">
                                                        <p className="text-[11px] uppercase tracking-widest text-[#999] font-semibold mb-2">Application Process</p>
                                                        <p className="text-sm text-[#444] bg-[#fafafa] rounded px-3 py-2">{review.description}</p>
                                                    </div>
                                                )}

                                                {review.tips && (
                                                    <div className="bg-[#fffbf5] border-l-3 border-maceng-orange/40 rounded-r px-4 py-3 mb-4">
                                                        <p className="text-[11px] uppercase tracking-widest text-maceng-orange/70 font-semibold mb-1">Tips</p>
                                                        <p className="text-sm text-[#444]">{review.tips}</p>
                                                    </div>
                                                )}

                                                {feedback?.key === `dt-${review.id}` && (
                                                    <p className={`text-sm mb-3 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {feedback.message}
                                                    </p>
                                                )}

                                                <div className="flex gap-2 sm:gap-3 pt-3 border-t border-[#f0f0f0]">
                                                    <button
                                                        onClick={() => handleApproveDT(review.id)}
                                                        disabled={processing.has(`dt-${review.id}`)}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {processing.has(`dt-${review.id}`) ? '...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectDT(review.id)}
                                                        disabled={processing.has(`dt-${review.id}`)}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#f0f0f0] text-[#666] text-xs sm:text-sm rounded font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDT(review.id)}
                                                        disabled={processing.has(`dt-${review.id}`)}
                                                        className="px-3 sm:px-4 py-2 text-red-500 text-xs sm:text-sm font-medium hover:text-red-700 hover:bg-red-50 rounded transition-colors sm:ml-auto disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* ===== Add Company Tab ===== */}
                    {activeTab === 'create' && (
                        <section>
                            <div className="max-w-lg">
                                <h2 className="font-playfair text-lg text-maceng-maroon mb-1">Manually Add a Company</h2>
                                <p className="text-xs text-[#888] mb-5">Create a company directly without going through a request.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#333] mb-1.5">
                                            Company Name <span className="text-maceng-orange">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newCompanyName}
                                            onChange={(e) => setNewCompanyName(e.target.value)}
                                            placeholder="e.g. Google, AMD, Shopify"
                                            className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#333] mb-1.5">
                                            Industries
                                        </label>
                                        <input
                                            type="text"
                                            value={newCompanyIndustries}
                                            onChange={(e) => setNewCompanyIndustries(e.target.value)}
                                            placeholder="Comma separated: Software, Hardware, Finance..."
                                            className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                                        />
                                        <p className="text-xs text-[#888] mt-1">Optional. Separate multiple industries with commas.</p>
                                    </div>

                                    {createStatus === 'success' && (
                                        <p className="text-sm text-green-600 font-medium">✓ Company created successfully!</p>
                                    )}
                                    {createStatus === 'error' && (
                                        <p className="text-sm text-red-600 font-medium">Failed to create company. Try again.</p>
                                    )}

                                    <button
                                        onClick={handleCreateCompany}
                                        disabled={!newCompanyName.trim() || createStatus === 'creating'}
                                        className="px-6 py-2.5 bg-maceng-maroon text-white text-sm rounded font-medium hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {createStatus === 'creating' ? 'Creating...' : 'Create Company'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
