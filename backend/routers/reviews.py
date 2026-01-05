from fastapi import APIRouter, HTTPException, Query
from typing import List, Literal
from models import Review
from database import get_reviews_by_course_id

router = APIRouter()

@router.get("/courses/{course_id}/reviews", response_model=List[Review])
async def get_course_reviews(
    course_id: int,
    sort_by: Literal["recent", "rating"] = Query("recent", description="Sort reviews by recent or rating")
):
    """
    Get all reviews for a specific course.
    Used by the Course Page reviews tab.
    """
    reviews = get_reviews_by_course_id(course_id)
    
    # Sort reviews
    if sort_by == "recent":
        reviews.sort(key=lambda r: r.created_at, reverse=True)
    elif sort_by == "rating":
        reviews.sort(key=lambda r: r.rating, reverse=True)
    
    return reviews
