# MacEngDB API Docs

### Database Models

**Company**: 
- id: int (primary key)
- name: string (max 255)
- industry: string (max 100, indexed)
- rating: float (default 0.0)
- review_count: int (default 0)
- created_at: datetime
- updated_at: datetime
- experiences: Experience[] (one-to-many relationship)

**Experience**: 
- id: int (primary key)
- company_id: int (foreign key → companies.id)
- title: string (max 255)
- description: text
- created_at: datetime
- updated_at: datetime
- company: Company (back-reference)


### Landing Page

GET /api/companies
- Get all companies from the database.

URL Parameters:
- search: string (optional, filter by name)
- industry: string (optional, filter by industry)

Response Body: 
```json
{
    "companies": Company[]
}
```

### Company Page

GET /api/companies/{companyId}
- Get a specific company by ID.

Response Body:
```json
Company
```

GET /api/companies/{companyId}/experiences
- Get all experiences for a specific company.

Response Body:
```json
{
    "experiences": Experience[]
}
```

### Company Page

GET /api/company/{companyId}

GET /api/company/{companyId}/reviews

### Auth Pages

POST /api/auth/login

POST /api/auth/signup

### Profile Page
GET /api/{userId}/profile

POST /api/{userId}/update

GET /api/{userId}/reviews

POST /api/{userId}/reviews/{reviewId}
- For editing certain reviews

### Add Review Page
POST /api/{companyId}/review