from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Course
from database import get_all_courses, get_course_by_id

router = APIRouter()

@router.get("/courses", response_model=List[Course])
async def get_courses(
    search: Optional[str] = Query(None, description="Search by course code or title"),
    department: Optional[str] = Query(None, description="Filter by department")
):
    """
    Get all courses with optional filtering by search query and department.
    Used by the Landing Page.
    """
    courses = get_all_courses()
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        courses = [
            course for course in courses
            if search_lower in course.code.lower() or search_lower in course.title.lower()
        ]
    
    # Apply department filter
    if department and department != "All":
        courses = [course for course in courses if course.department == department]
    
    return courses

@router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: int):
    """
    Get a specific course by ID.
    Used by the Course Page to display course details.
    """
    course = get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
