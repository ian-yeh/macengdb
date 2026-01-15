import { type Company } from './types';
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

export async function fetchCompanyReviews() {
  //return mockReviews;
  return;
}

export async function fetchCompany(companyId: string): Promise<Company> {
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch company');
  }

  return response.json();
}