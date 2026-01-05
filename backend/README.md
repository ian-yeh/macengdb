# MacEng Course Database - Backend

FastAPI backend for the McMaster Engineering Course Database application.

## Features

- RESTful API for courses, reviews, and resources
- CORS enabled for frontend integration
- Mock database for development
- Swagger UI documentation at `/docs`

## Endpoints

### Courses
- `GET /api/courses` - Get all courses with optional search and department filtering
- `GET /api/courses/{course_id}` - Get a specific course by ID

### Reviews
- `GET /api/courses/{course_id}/reviews` - Get all reviews for a course (sortable by recent/rating)

### Resources
- `GET /api/courses/{course_id}/resources` - Get all resources for a course (filterable by type, sortable by upvotes/recent)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              # FastAPI application and configuration
├── models.py            # Pydantic models for request/response
├── database.py          # Mock database with sample data
├── routers/
│   ├── courses.py       # Course endpoints
│   ├── reviews.py       # Review endpoints
│   └── resources.py     # Resource endpoints
└── requirements.txt     # Python dependencies
```
