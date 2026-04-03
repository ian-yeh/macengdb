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

type AdminTab = 'requests' | 'dt-requests' | 'company-exp' | 'dt-exp' | 'create';

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

    const { 
        pendingExperiences, 
        pendingRequests, 
        pendingDTReviews, 
        pendingDTRequests, 
        isLoading, 
        totalPending 
    } = useAdminQueries(adminKey, authenticated);

    const [activeTab, setActiveTab] = useState<AdminTab>('requests');

    if (!authenticated) {
        return <AdminLogin onLogin={handleLogin} error={authError} />;
    }

    if (isLoading) return <Loader message="Loading admin panel..." />;

    const tabs: { id: AdminTab; label: string; count: number }[] = [
        { id: 'requests', label: 'Company Requests', count: pendingRequests.length },
        { id: 'dt-requests', label: 'DT Requests', count: pendingDTRequests.length },
        { id: 'company-exp', label: 'Experiences', count: pendingExperiences.length },
        { id: 'dt-exp', label: 'DT Experiences', count: pendingDTReviews.length },
        { id: 'create', label: '+ Add Company', count: 0 },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors duration-500">
            {/* Header */}
            <div className="border-b border-[#eee] dark:border-[#333] px-8 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-maceng-maroon dark:text-maceng-orange hover:opacity-80 transition-opacity text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        ← Home
                    </Link>
                    <div className="text-right">
                        <h1 className="font-playfair text-2xl font-bold dark:text-white">Admin Dashboard.</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999]">{totalPending} Submissions Pending</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10 flex gap-12">
                {/* Sidebar */}
                <nav className="w-64 space-y-2 flex-shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                activeTab === tab.id
                                    ? 'bg-maceng-maroon dark:bg-maceng-orange text-white shadow-lg'
                                    : 'text-[#999] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] hover:text-[#333] dark:hover:text-white'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    activeTab === tab.id ? 'bg-white/20' : 'bg-maceng-orange/10 text-maceng-orange'
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
                </main>
            </div>
        </div>
    );
}
