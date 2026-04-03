import { type Company, type Experience, type ExperienceSubmitData, type CompanyRequest, type DesignTeam, type DesignTeamReview, type DesignTeamReviewSubmitData, type DesignTeamRequest } from './types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

// companies API
export async function fetchCompanies(
  searchQuery?: string,
  industry?: string,
  minRating?: number,
  hasOffer?: boolean,
  position?: string
): Promise<Company[]> {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (industry && industry !== 'All') params.append('industry', industry);
  if (minRating !== undefined) params.append('min_rating', minRating.toString());
  if (hasOffer !== undefined) params.append('has_offer', hasOffer.toString());
  if (position) params.append('position', position);

  const url = `${API_BASE_URL}/companies${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }

  return response.json();
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const response = await fetch(`${API_BASE_URL}/companies/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Failed to search companies');
  }

  return response.json();
}

export async function fetchCompanyExperiences(companyId: string): Promise<Experience[]> {
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/experiences`);

  if (!response.ok) {
    throw new Error('Failed to fetch company experiences');
  }

  return response.json();
}

export async function fetchCompany(companyId: string): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch company');
  }

  return await response.json() as Company;
}

export async function submitExperience(data: ExperienceSubmitData): Promise<Experience> {
  const response = await fetch(`${API_BASE_URL}/experiences/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail?.[0]?.msg || errorData?.detail || 'Failed to submit experience';
    throw new Error(message);
  }

  return response.json();
}

// Admin API functions

export async function fetchPendingExperiences(adminKey: string): Promise<Experience[]> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/pending`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) {
    if (response.status === 403) throw new Error('Invalid admin key');
    throw new Error('Failed to fetch pending experiences');
  }

  return response.json();
}

export async function approveExperience(id: number, adminKey: string): Promise<Experience> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/${id}/approve`, {
    method: 'PATCH',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to approve experience');
  return response.json();
}

export async function rejectExperience(id: number, adminKey: string): Promise<Experience> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/${id}/reject`, {
    method: 'PATCH',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to reject experience');
  return response.json();
}
export async function updateExperience(id: number, adminKey: string, data: Partial<ExperienceSubmitData>): Promise<Experience> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update experience');
  return response.json();
}

export async function deleteExperience(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to delete experience');
}

export async function deleteCompany(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to delete company');
}

export async function updateCompany(id: number, adminKey: string, data: { name?: string; industries?: string[]; rating?: number }): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update company');
  return response.json();
}

export async function fetchAllExperiences(adminKey: string): Promise<Experience[]> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/all`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to fetch all experiences');
  return response.json();
}

// Company Request API functions

export async function submitCompanyRequest(name: string, email?: string): Promise<CompanyRequest> {
  const response = await fetch(`${API_BASE_URL}/company-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, requester_email: email }),
  });

  if (!response.ok) throw new Error('Failed to submit company request');
  return response.json();
}

export async function fetchPendingCompanyRequests(adminKey: string): Promise<CompanyRequest[]> {
  const response = await fetch(`${API_BASE_URL}/admin/company-requests`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to fetch company requests');
  return response.json();
}

export async function approveCompanyRequest(id: number, adminKey: string, industries: string[] = []): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/admin/company-requests/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ industries }),
  });

  if (!response.ok) throw new Error('Failed to approve company request');
  return response.json();
}

export async function rejectCompanyRequest(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/company-requests/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to reject company request');
}

export async function updateCompanyRequest(id: number, adminKey: string, name: string): Promise<CompanyRequest> {
  const response = await fetch(`${API_BASE_URL}/admin/company-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) throw new Error('Failed to update company request');
  return response.json();
}

// Design Teams API

export async function fetchDesignTeams(category?: string): Promise<DesignTeam[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);

  const url = `${API_BASE_URL}/design-teams${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error('Failed to fetch design teams');
  return response.json();
}

export async function fetchDesignTeam(teamId: string): Promise<DesignTeam> {
  const response = await fetch(`${API_BASE_URL}/design-teams/${teamId}`);

  if (!response.ok) throw new Error('Failed to fetch design team');
  return response.json();
}

export async function fetchDesignTeamReviews(teamId: string): Promise<DesignTeamReview[]> {
  const response = await fetch(`${API_BASE_URL}/design-teams/${teamId}/reviews`);

  if (!response.ok) throw new Error('Failed to fetch design team reviews');
  return response.json();
}

export async function submitDesignTeamReview(data: DesignTeamReviewSubmitData): Promise<DesignTeamReview> {
  const response = await fetch(`${API_BASE_URL}/design-teams/${data.design_team_id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail?.[0]?.msg || errorData?.detail || 'Failed to submit review';
    throw new Error(message);
  }

  return response.json();
}

// Admin - Design Team Reviews

export async function fetchPendingDesignTeamReviews(adminKey: string): Promise<DesignTeamReview[]> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to fetch pending design team reviews');
  return response.json();
}

export async function approveDesignTeamReview(id: number, adminKey: string): Promise<DesignTeamReview> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews/${id}/approve`, {
    method: 'PATCH',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to approve design team review');
  return response.json();
}

export async function rejectDesignTeamReview(id: number, adminKey: string): Promise<DesignTeamReview> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews/${id}/reject`, {
    method: 'PATCH',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to reject design team review');
  return response.json();
}

export async function deleteDesignTeamReview(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to delete design team review');
}

export async function deleteDesignTeam(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/design-teams/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to delete design team');
}

export async function updateDesignTeam(id: number, adminKey: string, data: { name?: string; categories?: string[] }): Promise<DesignTeam> {
  const response = await fetch(`${API_BASE_URL}/admin/design-teams/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update design team');
  return response.json();
}

export async function updateDesignTeamReview(id: number, adminKey: string, data: Partial<DesignTeamReviewSubmitData>): Promise<DesignTeamReview> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update review');
  return response.json();
}

export async function fetchAllDesignTeamReviews(adminKey: string): Promise<DesignTeamReview[]> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-reviews/all`, {
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to fetch all design team reviews');
  return response.json();
}

// Admin - Manual Company Creation

export async function adminCreateCompany(adminKey: string, name: string, industries: string[]): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/admin/companies`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, industries }),
  });

  if (!response.ok) throw new Error('Failed to create company');
  return response.json();
}

// Design Team Request API functions

export async function submitDesignTeamRequest(name: string, email?: string): Promise<DesignTeamRequest> {
  const response = await fetch(`${API_BASE_URL}/design-team-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, requester_email: email || null }),
  });
  if (!response.ok) throw new Error('Failed to submit design team request');
  return response.json();
}

export async function fetchPendingDesignTeamRequests(adminKey: string): Promise<DesignTeamRequest[]> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-requests`, {
    headers: { 'X-Admin-Key': adminKey },
  });
  if (!response.ok) throw new Error('Failed to fetch design team requests');
  return response.json();
}

export async function approveDesignTeamRequest(id: number, adminKey: string, categories: string[] = []): Promise<DesignTeam> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-requests/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categories }),
  });
  if (!response.ok) throw new Error('Failed to approve design team request');
  return response.json();
}

export async function rejectDesignTeamRequest(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-requests/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });
  if (!response.ok) throw new Error('Failed to reject design team request');
}

export async function updateDesignTeamRequest(id: number, adminKey: string, name: string): Promise<DesignTeamRequest> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to update design team request');
  return response.json();
}

export async function bulkDeleteCompanyRequests(ids: number[], adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/company-requests/bulk-reject`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!response.ok) throw new Error('Failed to bulk delete company requests');
}

export async function bulkDeleteDesignTeamRequests(ids: number[], adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/design-team-requests/bulk-reject`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!response.ok) throw new Error('Failed to bulk delete design team requests');
}