import { useQuery } from '@tanstack/react-query';
import {
    fetchPendingExperiences,
    fetchPendingCompanyRequests,
    fetchPendingDesignTeamReviews,
    fetchPendingDesignTeamRequests,
    fetchCompanies,
    fetchDesignTeams,
    fetchAllExperiences,
    fetchAllDesignTeamReviews
} from '../../api/api';

export function useAdminQueries(adminKey: string, authenticated: boolean, activeTab: string) {
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

    const { data: allCompanies = [] } = useQuery({
        queryKey: ['admin', 'all-companies'],
        queryFn: () => fetchCompanies(),
        enabled: authenticated && activeTab === 'manage-companies',
    });

    const { data: allDesignTeams = [] } = useQuery({
        queryKey: ['admin', 'all-teams'],
        queryFn: () => fetchDesignTeams(),
        enabled: authenticated && activeTab === 'manage-teams',
    });

    const { data: allExperiences = [] } = useQuery({
        queryKey: ['admin', 'all-experiences'],
        queryFn: () => fetchAllExperiences(adminKey),
        enabled: authenticated && activeTab === 'manage-experiences',
    });

    const { data: allDesignTeamReviews = [] } = useQuery({
        queryKey: ['admin', 'all-dt-reviews'],
        queryFn: () => fetchAllDesignTeamReviews(adminKey),
        enabled: authenticated && activeTab === 'manage-experiences',
    });

    const totalPending = pendingExperiences.length + pendingRequests.length + pendingDTReviews.length + pendingDTRequests.length;

    return {
        pendingExperiences,
        pendingRequests,
        pendingDTReviews,
        pendingDTRequests,
        allCompanies,
        allDesignTeams,
        allExperiences,
        allDesignTeamReviews,
        isLoading: expLoading || reqLoading || dtLoading || dtReqLoading,
        totalPending
    };
}
