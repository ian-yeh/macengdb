import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchPendingExperiences, approveExperience, rejectExperience, deleteExperience,
    fetchPendingCompanyRequests, approveCompanyRequest, rejectCompanyRequest
} from '../api/api';
import { type Experience, type CompanyRequest } from '../api/types';
import Loader from '../components/Loader';

export default function AdminPage() {
    const queryClient = useQueryClient();
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
    const [keyInput, setKeyInput] = useState('');
    const [authenticated, setAuthenticated] = useState(() => !!sessionStorage.getItem('adminKey'));
    const [authError, setAuthError] = useState('');
    const [feedback, setFeedback] = useState<{ key: string; message: string; type: 'success' | 'error' } | null>(null);

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

    // Experience actions
    const handleApproveExp = async (id: number) => {
        try {
            await approveExperience(id, adminKey);
            showFeedback(`exp-${id}`, 'Approved!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
        } catch { showFeedback(`exp-${id}`, 'Failed', 'error'); }
    };

    const handleRejectExp = async (id: number) => {
        try {
            await rejectExperience(id, adminKey);
            showFeedback(`exp-${id}`, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(`exp-${id}`, 'Failed', 'error'); }
    };

    const handleDeleteExp = async (id: number) => {
        try {
            await deleteExperience(id, adminKey);
            showFeedback(`exp-${id}`, 'Deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback(`exp-${id}`, 'Failed', 'error'); }
    };

    const [requestIndustries, setRequestIndustries] = useState<Record<number, string>>({});

    const handleApproveReq = async (id: number) => {
        try {
            const industries = requestIndustries[id]
                ? requestIndustries[id].split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await approveCompanyRequest(id, adminKey, industries);
            showFeedback(`req-${id}`, 'Company created!', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback(`req-${id}`, 'Failed', 'error'); }
    };

    const handleRejectReq = async (id: number) => {
        try {
            await rejectCompanyRequest(id, adminKey);
            showFeedback(`req-${id}`, 'Rejected', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        } catch { showFeedback(`req-${id}`, 'Failed', 'error'); }
    };

    // Login gate
    if (!authenticated) {
        return (
            <div className="min-h-screen py-12 px-8 max-w-md mx-auto">
                <Link to="/" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm">
                    ← Back to companies
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

    if (expLoading || reqLoading) return <Loader message="Loading admin panel..." />;

    const totalPending = pendingExperiences.length + pendingRequests.length;

    return (
        <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm">
                        ← Back to companies
                    </Link>
                    <button onClick={handleLogout} className="text-xs text-[#888] hover:text-maceng-maroon transition-colors">
                        Logout
                    </button>
                </div>
                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    Admin Panel
                </h1>
                <p className="text-[15px] text-[#555]">
                    <span className="font-medium text-maceng-maroon">{totalPending}</span> item{totalPending !== 1 ? 's' : ''} awaiting review
                </p>
            </header>

            {/* Company Requests Section */}
            <section className="mb-12">
                <h2 className="font-playfair italic text-maceng-maroon text-xl mb-4 flex items-baseline gap-2">
                    Company Requests
                    {pendingRequests.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-inter not-italic font-medium">
                            {pendingRequests.length}
                        </span>
                    )}
                </h2>

                {pendingRequests.length === 0 ? (
                    <p className="text-sm text-[#888] italic py-4">No pending company requests.</p>
                ) : (
                    <div className="space-y-3">
                        {pendingRequests.map((req: CompanyRequest) => {
                            const date = new Date(req.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            });
                            return (
                                <div key={req.id} className="flex flex-col border border-[#e5e5e5] rounded-lg bg-white overflow-hidden animate-row-in">
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#f5f5f5]">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-[#222] text-[15px]">{req.name}</span>
                                                <span className="text-xs text-[#aaa]">{date}</span>
                                            </div>
                                            {req.requester_email && (
                                                <div className="text-[11px] text-maceng-orange font-medium mt-0.5">
                                                    Requested by: {req.requester_email}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRejectReq(req.id)}
                                                className="px-3 py-1.5 text-[#888] text-xs font-medium hover:text-red-600 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-[#fafafa] px-5 py-3 flex items-center gap-4">
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
                                                className="px-4 py-1.5 bg-maceng-maroon text-white text-xs rounded font-medium hover:bg-maceng-maroon/90 shadow-sm transition-all"
                                            >
                                                Approve & Create
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Experience Reviews Section */}
            <section>
                <h2 className="font-playfair italic text-maceng-maroon text-xl mb-4 flex items-baseline gap-2">
                    Experience Submissions
                    {pendingExperiences.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-inter not-italic font-medium">
                            {pendingExperiences.length}
                        </span>
                    )}
                </h2>

                {pendingExperiences.length === 0 ? (
                    <p className="text-sm text-[#888] italic py-4">No pending experience submissions.</p>
                ) : (
                    <div className="space-y-6">
                        {pendingExperiences.map((experience: Experience) => {
                            const formattedDate = new Date(experience.created_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            });

                            return (
                                <article key={experience.id} className="border border-[#e5e5e5] rounded-lg p-6 bg-white animate-row-in">
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

                                    <div className="flex gap-3 pt-3 border-t border-[#f0f0f0]">
                                        <button onClick={() => handleApproveExp(experience.id)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors">
                                            ✓ Approve
                                        </button>
                                        <button onClick={() => handleRejectExp(experience.id)}
                                            className="px-4 py-2 bg-[#f0f0f0] text-[#666] text-sm rounded font-medium hover:bg-[#e0e0e0] transition-colors">
                                            ✗ Reject
                                        </button>
                                        <button onClick={() => handleDeleteExp(experience.id)}
                                            className="px-4 py-2 text-red-500 text-sm font-medium hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-auto">
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
