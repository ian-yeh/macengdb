# MacEngDB API Docs

## Database Models

### User
- id: int (primary key)
- email: string (unique, must be @mcmaster.ca)
- password_hash: string
- name: string (display name)
- program: enum (Software, Electrical, Mechanical, Civil, Chemical, Materials, Engineering Physics, Computer, Mechatronics)
- graduation_year: int (e.g., 2025)
- role: enum (Student, Alumni) - auto-determined by graduation year
- is_verified: boolean (email verification)
- created_at: datetime
- updated_at: datetime
- experiences: Experience[] (one-to-many)

### Company
- id: int (primary key)
- name: string (max 255)
- industries: string[] (array of industry names)
- rating: float (default 0.0, computed from experiences)
- created_at: datetime
- updated_at: datetime
- experiences: Experience[] (one-to-many)

### Experience
- id: int (primary key)
- user_id: int (foreign key → users.id)
- company_id: int (foreign key → companies.id)
- position: string (e.g., "Software Engineering Intern")
- term: string (e.g., "Summer 2024", "Fall 2023")
- offer_received: boolean
- difficulty: int (1-5 scale)
- stages: JSON (structured interview stages)
- tips: text (optional advice)
- created_at: datetime
- updated_at: datetime

#### Experience.stages JSON structure:
```json
[
  {
    "name": "Online Assessment",
    "duration": "60 min",
    "questions": ["2 LeetCode mediums", "Multiple choice on data structures"]
  },
  {
    "name": "Technical Interview",
    "duration": "45 min",
    "questions": ["System design: URL shortener", "Behavioral mixed in"]
  },
  {
    "name": "Final Round",
    "duration": "30 min",
    "questions": ["Team fit discussion", "Questions about projects"]
  }
]
```

---

## API Endpoints

### Auth

POST /api/auth/signup
- Register with McMaster email (@mcmaster.ca required)

POST /api/auth/login
- Login with email/password

POST /api/auth/verify
- Verify email with token

POST /api/auth/logout
- Logout current session

---

### Companies

GET /api/companies
- Get all companies

Query Parameters:
- search: string (filter by name or industry)
- industry: string (filter companies that include this industry)

GET /api/companies/{companyId}
- Get company by ID

GET /api/companies/{companyId}/experiences
- Get all experiences for a company

---

### Experiences

POST /api/experiences
- Create new experience (requires auth)

GET /api/experiences/{experienceId}
- Get experience by ID

PUT /api/experiences/{experienceId}
- Update experience (owner only)

DELETE /api/experiences/{experienceId}
- Delete experience (owner only)

---

### User Profile

GET /api/users/me
- Get current user profile (requires auth)

PUT /api/users/me
- Update current user profile

GET /api/users/{userId}/experiences
- Get all experiences by a user