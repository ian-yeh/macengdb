export interface Course {
  id: number;
  code: string;
  title: string;
  department: string;
  rating: number;
  difficulty: number;
  workload: number;
  reviewCount: number;
  resourceCount: number;
  description?: string;
}

export interface Review {
  id: number;
  courseId: number;
  rating: number;
  difficulty: number;
  workload: number;
  professor: string;
  term: string;
  reviewText: string;
  createdAt: string;
}

export interface Resource {
  id: number;
  courseId: number;
  title: string;
  description: string;
  url: string;
  resourceType: 'video' | 'notes' | 'practice' | 'tools';
  topicTags: string[];
  upvotes: number;
  createdAt: string;
}