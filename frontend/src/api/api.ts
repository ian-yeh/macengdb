import { type Company, type Experience, type ExperienceSubmitData, type CompanyRequest } from './types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

// companies API
export async function fetchCompanies(searchQuery?: string, industry?: string): Promise<Company[]> {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (industry && industry !== 'All') params.append('industry', industry);

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

export async function deleteExperience(id: number, adminKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/experiences/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });

  if (!response.ok) throw new Error('Failed to delete experience');
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