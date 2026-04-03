import { useQuery } from '@tanstack/react-query';
import {
    fetchPendingExperiences,
    fetchPendingCompanyRequests,
    fetchPendingDesignTeamReviews,
    fetchPendingDesignTeamRequests
} from '../../api/api';

export function useAdminQueries(adminKey: string, authenticated: boolean) {
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

    const totalPending = pendingExperiences.length + pendingRequests.length + pendingDTReviews.length + pendingDTRequests.length;

    return {
        pendingExperiences,
        pendingRequests,
        pendingDTReviews,
        pendingDTRequests,
        isLoading: expLoading || reqLoading || dtLoading || dtReqLoading,
        totalPending
    };
}
