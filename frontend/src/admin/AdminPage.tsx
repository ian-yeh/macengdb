import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useAdminQueries } from './hooks/useAdminQueries';
import AdminLogin from './components/AdminLogin';
import CompanyRequestsTab from './components/CompanyRequestsTab';
import DesignTeamRequestsTab from './components/DesignTeamRequestsTab';
import CompanyExperiencesTab from './components/CompanyExperiencesTab';
import DesignTeamExperiencesTab from './components/DesignTeamExperiencesTab';
import CreateCompanyTab from './components/CreateCompanyTab';

import ManageCompaniesTab from './components/ManageCompaniesTab';
import ManageDesignTeamsTab from './components/ManageDesignTeamsTab';
import ManageExperiencesTab from './components/ManageExperiencesTab';

type AdminTab = 'requests' | 'dt-requests' | 'company-exp' | 'dt-exp' | 'create' | 'manage-companies' | 'manage-teams' | 'manage-experiences';
type AdminMode = 'submissions' | 'management';

export default function AdminPage() {
    const { 
        adminKey, 
        authenticated, 
        authError, 
        feedback, 
        processing, 
        handleLogin, 
        showFeedback, 
        startProcessing, 
        stopProcessing 
    } = useAdminAuth();

    const [activeMode, setActiveMode] = useState<AdminMode>('submissions');
    const [activeTab, setActiveTab] = useState<AdminTab>('requests');

    const { 
        pendingExperiences, 
        pendingRequests, 
        pendingDTReviews, 
        pendingDTRequests,
        allCompanies,
        allDesignTeams,
        allExperiences,
        allDesignTeamReviews,
        isLoading, 
        totalPending 
    } = useAdminQueries(adminKey, authenticated, activeTab);

    if (!authenticated) {
        return <AdminLogin onLogin={handleLogin} error={authError} />;
    }

    if (isLoading) return <Loader message="Loading admin panel..." />;

    const submissionTabs: { id: AdminTab; label: string; count: number }[] = [
        { id: 'requests', label: 'Company Requests', count: pendingRequests.length },
        { id: 'dt-requests', label: 'DT Requests', count: pendingDTRequests.length },
        { id: 'company-exp', label: 'Experiences', count: pendingExperiences.length },
        { id: 'dt-exp', label: 'DT Experiences', count: pendingDTReviews.length },
        { id: 'create', label: '+ Add Company', count: 0 },
    ];

    const managementTabs: { id: AdminTab; label: string; count: number }[] = [
        { id: 'manage-companies', label: 'Manage Companies', count: allCompanies.length },
        { id: 'manage-teams', label: 'Manage Teams', count: allDesignTeams.length },
        { id: 'manage-experiences', label: 'All Experiences', count: allExperiences.length + allDesignTeamReviews.length },
    ];

    const currentTabs = activeMode === 'submissions' ? submissionTabs : managementTabs;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors duration-500">
            {/* Header */}
            <div className="border-b border-[#eee] dark:border-[#333] px-8 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-maceng-maroon dark:text-maceng-orange hover:opacity-80 transition-opacity text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        ← Home
                    </Link>
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <h1 className="font-playfair text-2xl font-bold dark:text-white">Admin Dashboard.</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#999]">{totalPending} Submissions Pending</p>
                        </div>
                        
                        <div className="flex bg-[#f5f5f5] dark:bg-[#1a1a1a] p-1 rounded-lg border border-[#eee] dark:border-[#333]">
                            <button 
                                onClick={() => { setActiveMode('submissions'); setActiveTab('requests'); }}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    activeMode === 'submissions' 
                                        ? 'bg-white dark:bg-[#333] shadow-sm text-maceng-maroon dark:text-maceng-orange' 
                                        : 'text-[#999] hover:text-[#666]'
                                }`}
                            >
                                Submissions
                            </button>
                            <button 
                                onClick={() => { setActiveMode('management'); setActiveTab('manage-companies'); }}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    activeMode === 'management' 
                                        ? 'bg-white dark:bg-[#333] shadow-sm text-maceng-maroon dark:text-maceng-orange' 
                                        : 'text-[#999] hover:text-[#666]'
                                }`}
                            >
                                Management
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10 flex gap-12">
                {/* Sidebar */}
                <nav className="w-64 space-y-2 flex-shrink-0">
                    {currentTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                activeTab === tab.id
                                    ? 'bg-maceng-maroon dark:bg-maceng-orange text-white shadow-lg shadow-maceng-maroon/20 dark:shadow-maceng-orange/20 scale-[1.02]'
                                    : 'text-[#999] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] hover:text-[#333] dark:hover:text-white'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    activeTab === tab.id ? 'bg-white/20' : 'bg-[#eee] dark:bg-[#333] text-[#666] dark:text-[#a0a0a0]'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <main className="flex-1 min-w-0">
                    {feedback && (
                        <div className={`mb-6 p-4 rounded-xl font-bold text-sm text-center animate-fade-down ${
                            feedback.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {feedback.message}
                        </div>
                    )}

                    {/* Submissions Tabs */}
                    {activeTab === 'requests' && (
                        <CompanyRequestsTab 
                            requests={pendingRequests} 
                            adminKey={adminKey} 
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'dt-requests' && (
                        <DesignTeamRequestsTab 
                            requests={pendingDTRequests} 
                            adminKey={adminKey} 
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'company-exp' && (
                        <CompanyExperiencesTab 
                            experiences={pendingExperiences} 
                            adminKey={adminKey} 
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'dt-exp' && (
                        <DesignTeamExperiencesTab 
                            reviews={pendingDTReviews} 
                            adminKey={adminKey} 
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'create' && (
                        <CreateCompanyTab 
                            adminKey={adminKey} 
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}

                    {/* Management Tabs */}
                    {activeTab === 'manage-companies' && (
                        <ManageCompaniesTab 
                            companies={allCompanies}
                            adminKey={adminKey}
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'manage-teams' && (
                        <ManageDesignTeamsTab 
                            teams={allDesignTeams}
                            adminKey={adminKey}
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                    {activeTab === 'manage-experiences' && (
                        <ManageExperiencesTab 
                            experiences={allExperiences}
                            reviews={allDesignTeamReviews}
                            adminKey={adminKey}
                            showFeedback={showFeedback}
                            startProcessing={startProcessing}
                            stopProcessing={stopProcessing}
                            processing={processing}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
