import { type Course, type Review, type Resource } from './mockData';

const API_BASE_URL = 'http://localhost:8000/api';

// Courses API
export async function fetchCourses(searchQuery?: string, department?: string): Promise<Course[]> {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (department && department !== 'All') params.append('department', department);
  
  const url = `${API_BASE_URL}/courses${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return response.json();
}

export async function fetchCourse(courseId: number): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch course');
  }
  
  return response.json();
}

// Reviews API
export async function fetchCourseReviews(courseId: number, sortBy: 'recent' | 'rating' = 'recent'): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews?sort_by=${sortBy}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  
  return response.json();
}

// Resources API
export async function fetchCourseResources(
  courseId: number,
  resourceType: string = 'all',
  sortBy: 'recent' | 'upvotes' = 'upvotes'
): Promise<Resource[]> {
  const params = new URLSearchParams();
  if (resourceType) params.append('resource_type', resourceType);
  params.append('sort_by', sortBy);
  
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/resources?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch resources');
  }
  
  return response.json();
}
