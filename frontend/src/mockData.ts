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

export const mockCourses: Course[] = [
  {
    id: 1,
    code: 'COMPSCI 2C03',
    title: 'Data Structures and Algorithms',
    department: 'Computer Science',
    rating: 4.2,
    difficulty: 3.8,
    workload: 12,
    reviewCount: 47,
    resourceCount: 23,
    description: 'Introduction to data structures and algorithms including complexity analysis, sorting, searching, trees, graphs, and dynamic programming.',
  },
  {
    id: 2,
    code: 'ENGINEER 1P13',
    title: 'Engineering Design & Graphics',
    department: 'Engineering',
    rating: 3.8,
    difficulty: 2.5,
    workload: 8,
    reviewCount: 62,
    resourceCount: 18,
    description: 'Introduction to engineering design process, technical drawing, CAD modeling, and team-based project work.',
  },
  {
    id: 3,
    code: 'ELECENG 2CI5',
    title: 'Electric Circuits',
    department: 'Electrical',
    rating: 4.1,
    difficulty: 4.2,
    workload: 14,
    reviewCount: 34,
    resourceCount: 31,
    description: 'Basic circuit theory including DC and AC circuits, transient analysis, phasors, and circuit analysis techniques.',
  },
  {
    id: 4,
    code: 'CIVENG 2Q04',
    title: 'Mechanics of Materials',
    department: 'Civil',
    rating: 3.9,
    difficulty: 3.9,
    workload: 11,
    reviewCount: 28,
    resourceCount: 19,
    description: 'Stress, strain, mechanical properties of materials, axial loading, torsion, bending, and deflection of beams.',
  },
  {
    id: 5,
    code: 'MATH 2Z03',
    title: 'Engineering Mathematics III',
    department: 'Mathematics',
    rating: 3.6,
    difficulty: 4.5,
    workload: 15,
    reviewCount: 51,
    resourceCount: 42,
    description: 'Linear algebra, vector calculus, partial differential equations, and Fourier series for engineering applications.',
  },
  {
    id: 6,
    code: 'MECHENG 3K04',
    title: 'Fluid Mechanics I',
    department: 'Mechanical',
    rating: 4.0,
    difficulty: 3.7,
    workload: 10,
    reviewCount: 22,
    resourceCount: 15,
    description: 'Fluid properties, fluid statics, fluid dynamics, Bernoulli equation, and applications in engineering.',
  },
];

export const mockReviews: Review[] = [
  {
    id: 1,
    courseId: 1,
    rating: 5,
    difficulty: 4,
    workload: 12,
    professor: 'Dr. Smith',
    term: 'Fall 2025',
    reviewText: 'Challenging but rewarding course. The assignments really helped reinforce the concepts. Dr. Smith explains things clearly and the TAs were very helpful during office hours.',
    createdAt: '2025-12-15',
  },
  {
    id: 2,
    courseId: 1,
    rating: 4,
    difficulty: 4,
    workload: 14,
    professor: 'Dr. Johnson',
    term: 'Winter 2025',
    reviewText: 'Heavy workload but you learn a lot. Make sure to start assignments early. The midterm was fair but the final was tough.',
    createdAt: '2025-11-20',
  },
  {
    id: 3,
    courseId: 1,
    rating: 3,
    difficulty: 3,
    workload: 10,
    professor: 'Dr. Smith',
    term: 'Fall 2024',
    reviewText: 'Good course overall. Some topics like dynamic programming were rushed. Practice problems are essential for success.',
    createdAt: '2025-10-05',
  },
  {
    id: 4,
    courseId: 1,
    rating: 5,
    difficulty: 4,
    workload: 13,
    professor: 'Dr. Johnson',
    term: 'Winter 2024',
    reviewText: 'Best CS course I\'ve taken so far. Really builds strong foundation for technical interviews. Dr. Johnson is amazing!',
    createdAt: '2025-09-12',
  },
  {
    id: 5,
    courseId: 1,
    rating: 4,
    difficulty: 4,
    workload: 11,
    professor: 'Dr. Smith',
    term: 'Fall 2023',
    reviewText: 'Solid course content. Lectures can be dry sometimes but the material is super important. Go to tutorials!',
    createdAt: '2025-08-28',
  },
];

export const mockResources: Resource[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Complete Big O Notation Guide',
    description: 'Comprehensive video series covering time and space complexity analysis with examples',
    url: 'https://youtube.com/watch?v=example1',
    resourceType: 'video',
    topicTags: ['complexity', 'big-o', 'fundamentals'],
    upvotes: 142,
    createdAt: '2025-09-15',
  },
  {
    id: 2,
    courseId: 1,
    title: 'Binary Search Trees Visualizer',
    description: 'Interactive tool for visualizing BST operations including insertion, deletion, and traversal',
    url: 'https://visualgo.net/bst',
    resourceType: 'tools',
    topicTags: ['trees', 'bst', 'visualization'],
    upvotes: 98,
    createdAt: '2025-10-02',
  },
  {
    id: 3,
    courseId: 1,
    title: 'Midterm 2024 Practice Problems',
    description: 'Collection of practice problems similar to actual midterm questions with solutions',
    url: 'https://drive.google.com/example',
    resourceType: 'practice',
    topicTags: ['midterm', 'practice', 'exam-prep'],
    upvotes: 215,
    createdAt: '2025-10-20',
  },
  {
    id: 4,
    courseId: 1,
    title: 'Sorting Algorithms Cheat Sheet',
    description: 'One-page reference for all sorting algorithms with time complexities and use cases',
    url: 'https://example.com/sorting-cheatsheet.pdf',
    resourceType: 'notes',
    topicTags: ['sorting', 'algorithms', 'reference'],
    upvotes: 187,
    createdAt: '2025-11-05',
  },
  {
    id: 5,
    courseId: 1,
    title: 'Graph Algorithms Tutorial',
    description: 'Step-by-step walkthrough of DFS, BFS, Dijkstra, and other graph algorithms',
    url: 'https://youtube.com/watch?v=example2',
    resourceType: 'video',
    topicTags: ['graphs', 'algorithms', 'tutorial'],
    upvotes: 156,
    createdAt: '2025-11-18',
  },
  {
    id: 6,
    courseId: 1,
    title: 'Dynamic Programming Solutions',
    description: 'Annotated solutions to all DP problems from assignments and lectures',
    url: 'https://github.com/example/dp-solutions',
    resourceType: 'notes',
    topicTags: ['dynamic-programming', 'solutions', 'assignments'],
    upvotes: 203,
    createdAt: '2025-12-01',
  },
];
