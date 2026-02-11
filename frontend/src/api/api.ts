import { type Company, type Experience, type ExperienceSubmitData } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

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