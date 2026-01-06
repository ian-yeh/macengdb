from pydantic import BaseModel, Field
from typing import List, Literal
#from datetime import datetime

# Course Models
class CourseBase(BaseModel):
    code: str
    title: str
    department: str
    rating: float
    difficulty: float
    workload: int
    review_count: int = Field(alias="reviewCount")
    resource_count: int = Field(alias="resourceCount")
    description: str | None = None

    class Config:
        populate_by_name = True

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True
        populate_by_name = True


# Review Models
class ReviewBase(BaseModel):
    course_id: int = Field(alias="courseId")
    rating: int = Field(ge=1, le=5)
    difficulty: int = Field(ge=1, le=5)
    workload: int = Field(ge=0)
    professor: str
    term: str
    review_text: str = Field(alias="reviewText")

    class Config:
        populate_by_name = True

class Review(ReviewBase):
    id: int
    created_at: str = Field(alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True

class ReviewCreate(ReviewBase):
    pass


# Resource Models
class ResourceBase(BaseModel):
    course_id: int = Field(alias="courseId")
    title: str
    description: str
    url: str
    resource_type: Literal["video", "notes", "practice", "tools"] = Field(alias="resourceType")
    topic_tags: List[str] = Field(alias="topicTags")

    class Config:
        populate_by_name = True

class Resource(ResourceBase):
    id: int
    upvotes: int = 0
    created_at: str = Field(alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True

class ResourceCreate(ResourceBase):
    pass
