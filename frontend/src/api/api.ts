import { type Company, type Experience } from './types';
//import { mockReviews } from '../lib/types';

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