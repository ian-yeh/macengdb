from fastapi import APIRouter, HTTPException, Query
from typing import List, Literal, Optional
from src.utils.schemas import Resource
from src.utils.database import get_resources_by_course_id

router = APIRouter()

@router.get("/courses/{course_id}/resources", response_model=List[Resource])
async def get_course_resources(
    course_id: int,
    resource_type: Optional[str] = Query("all", description="Filter by resource type: all, video, notes, practice, tools"),
    sort_by: Literal["recent", "upvotes"] = Query("upvotes", description="Sort resources by recent or upvotes")
):
    """
    Get all resources for a specific course with optional filtering and sorting.
    Used by the Course Page resources tab.
    """
    resources = get_resources_by_course_id(course_id)
    
    # Apply resource type filter
    if resource_type and resource_type != "all":
        resources = [r for r in resources if r.resource_type == resource_type]
    
    # Sort resources
    if sort_by == "upvotes":
        resources.sort(key=lambda r: r.upvotes, reverse=True)
    elif sort_by == "recent":
        resources.sort(key=lambda r: r.created_at, reverse=True)
    
    return resources
