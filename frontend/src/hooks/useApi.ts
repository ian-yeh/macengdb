import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompanies,
  fetchCompany,
  fetchCompanyExperiences,
  submitExperience,
} from '../api/api';
import { type Company, type Experience, type ExperienceSubmitData } from '../api/types';

// Query Keys for React Query
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  experiences: (companyId: string) => [...companyKeys.detail(companyId), 'experiences'] as const,
};

// ==========================================================
// Query Hooks (GET requests)
// ==========================================================

export function useCompanies(
  searchQuery?: string,
  industry?: string,
  minRating?: number,
  hasOffer?: boolean,
  position?: string
) {
  return useQuery<Company[], Error>({
    queryKey: companyKeys.list({ searchQuery, industry, minRating, hasOffer, position }),
    queryFn: () => fetchCompanies(searchQuery, industry, minRating, hasOffer, position),
  });
}

export function useCompany(companyId: string) {
  return useQuery<Company, Error>({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId, // Only run query if companyId is available
  });
}

export function useCompanyExperiences(companyId: string) {
  return useQuery<Experience[], Error>({
    queryKey: companyKeys.experiences(companyId),
    queryFn: () => fetchCompanyExperiences(companyId),
    enabled: !!companyId, // Only run query if companyId is available
  });
}

// ==========================================================
// Mutation Hooks (POST/PATCH/DELETE requests)
// ==========================================================

export function useSubmitExperience() {
  const queryClient = useQueryClient();
  return useMutation<Experience, Error, ExperienceSubmitData>({
    mutationFn: submitExperience,
    onSuccess: (newExperience) => {
      // Invalidate queries to refetch data that might have changed
      // For example, if submitting an experience should update a company's experience list
      if (newExperience.company_id) {
        queryClient.invalidateQueries({ 
          queryKey: companyKeys.experiences(String(newExperience.company_id)) 
        });
      }
    },
  });
}
