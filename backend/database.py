from typing import List
from models import Course, Review, Resource

# Mock database - in production, this would be a real database
mock_courses: List[Course] = [
    Course(
        id=1,
        code="COMPSCI 2C03",
        title="Data Structures and Algorithms",
        department="Computer Science",
        rating=4.2,
        difficulty=3.8,
        workload=12,
        reviewCount=47,
        resourceCount=23,
        description="Introduction to data structures and algorithms including complexity analysis, sorting, searching, trees, graphs, and dynamic programming."
    ),
    Course(
        id=2,
        code="ENGINEER 1P13",
        title="Engineering Design & Graphics",
        department="Engineering",
        rating=3.8,
        difficulty=2.5,
        workload=8,
        reviewCount=62,
        resourceCount=18,
        description="Introduction to engineering design process, technical drawing, CAD modeling, and team-based project work."
    ),
    Course(
        id=3,
        code="ELECENG 2CI5",
        title="Electric Circuits",
        department="Electrical",
        rating=4.1,
        difficulty=4.2,
        workload=14,
        reviewCount=34,
        resourceCount=31,
        description="Basic circuit theory including DC and AC circuits, transient analysis, phasors, and circuit analysis techniques."
    ),
    Course(
        id=4,
        code="CIVENG 2Q04",
        title="Mechanics of Materials",
        department="Civil",
        rating=3.9,
        difficulty=3.9,
        workload=11,
        reviewCount=28,
        resourceCount=19,
        description="Stress, strain, mechanical properties of materials, axial loading, torsion, bending, and deflection of beams."
    ),
    Course(
        id=5,
        code="MATH 2Z03",
        title="Engineering Mathematics III",
        department="Mathematics",
        rating=3.6,
        difficulty=4.5,
        workload=15,
        reviewCount=51,
        resourceCount=42,
        description="Linear algebra, vector calculus, partial differential equations, and Fourier series for engineering applications."
    ),
    Course(
        id=6,
        code="MECHENG 3K04",
        title="Fluid Mechanics I",
        department="Mechanical",
        rating=4.0,
        difficulty=3.7,
        workload=10,
        reviewCount=22,
        resourceCount=15,
        description="Fluid properties, fluid statics, fluid dynamics, Bernoulli equation, and applications in engineering."
    ),
]

mock_reviews: List[Review] = [
    Review(
        id=1,
        courseId=1,
        rating=5,
        difficulty=4,
        workload=12,
        professor="Dr. Smith",
        term="Fall 2025",
        reviewText="Challenging but rewarding course. The assignments really helped reinforce the concepts. Dr. Smith explains things clearly and the TAs were very helpful during office hours.",
        createdAt="2025-12-15"
    ),
    Review(
        id=2,
        courseId=1,
        rating=4,
        difficulty=4,
        workload=14,
        professor="Dr. Johnson",
        term="Winter 2025",
        reviewText="Heavy workload but you learn a lot. Make sure to start assignments early. The midterm was fair but the final was tough.",
        createdAt="2025-11-20"
    ),
    Review(
        id=3,
        courseId=1,
        rating=3,
        difficulty=3,
        workload=10,
        professor="Dr. Smith",
        term="Fall 2024",
        reviewText="Good course overall. Some topics like dynamic programming were rushed. Practice problems are essential for success.",
        createdAt="2025-10-05"
    ),
    Review(
        id=4,
        courseId=1,
        rating=5,
        difficulty=4,
        workload=13,
        professor="Dr. Johnson",
        term="Winter 2024",
        reviewText="Best CS course I've taken so far. Really builds strong foundation for technical interviews. Dr. Johnson is amazing!",
        createdAt="2025-09-12"
    ),
    Review(
        id=5,
        courseId=1,
        rating=4,
        difficulty=4,
        workload=11,
        professor="Dr. Smith",
        term="Fall 2023",
        reviewText="Solid course content. Lectures can be dry sometimes but the material is super important. Go to tutorials!",
        createdAt="2025-08-28"
    ),
]

mock_resources: List[Resource] = [
    Resource(
        id=1,
        courseId=1,
        title="Complete Big O Notation Guide",
        description="Comprehensive video series covering time and space complexity analysis with examples",
        url="https://youtube.com/watch?v=example1",
        resourceType="video",
        topicTags=["complexity", "big-o", "fundamentals"],
        upvotes=142,
        createdAt="2025-09-15"
    ),
    Resource(
        id=2,
        courseId=1,
        title="Binary Search Trees Visualizer",
        description="Interactive tool for visualizing BST operations including insertion, deletion, and traversal",
        url="https://visualgo.net/bst",
        resourceType="tools",
        topicTags=["trees", "bst", "visualization"],
        upvotes=98,
        createdAt="2025-10-02"
    ),
    Resource(
        id=3,
        courseId=1,
        title="Midterm 2024 Practice Problems",
        description="Collection of practice problems similar to actual midterm questions with solutions",
        url="https://drive.google.com/example",
        resourceType="practice",
        topicTags=["midterm", "practice", "algorithms"],
        upvotes=87,
        createdAt="2025-08-20"
    ),
    Resource(
        id=4,
        courseId=1,
        title="Dynamic Programming Study Notes",
        description="Detailed notes covering all DP concepts with step-by-step explanations",
        url="https://notion.so/example",
        resourceType="notes",
        topicTags=["dynamic-programming", "algorithms", "notes"],
        upvotes=76,
        createdAt="2025-10-15"
    ),
]

def get_all_courses() -> List[Course]:
    """Get all courses"""
    return mock_courses

def get_course_by_id(course_id: int) -> Course | None:
    """Get a specific course by ID"""
    for course in mock_courses:
        if course.id == course_id:
            return course
    return None

def get_reviews_by_course_id(course_id: int) -> List[Review]:
    """Get all reviews for a specific course"""
    return [review for review in mock_reviews if review.course_id == course_id]

def get_resources_by_course_id(course_id: int) -> List[Resource]:
    """Get all resources for a specific course"""
    return [resource for resource in mock_resources if resource.course_id == course_id]
