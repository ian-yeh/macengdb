# Plan for MacEngDB
MacEngDB is a full-stack application used to centralize all course resources in McMaster Engineering. From resources, reviews, and professor reviews, everything is in one place, saving the stress from searching endlessly for answers.

### Tech Stack
Frontend: React + Vite
Backend: FastAPI + Python
Database: PostgreSQL + Neon, SQLAlchemy ORM
Authentication: JWT tokens, email verification
Deployment: Vercel (frontend), Railway/Render (backend)

### Database Design
User: id, email, password_hash, created_at, verified, verification_token --> many resources, reviews 
Course: id, name, code, description, department, resource_count, review_count,  --> many resources, reviews
Resource: id, title, created_at, updated_at, url, description, resource_type, topic_tags (array), upvotes (default 0) --> one user, one course
Review: id, review_text, created_at, updated_at, rating (1-5), difficulty (1-5), workload (hrs/week), professor, term --> one user, one course
Resource_Votes: user_id, resource_id, created_at (composite PK to track upvotes)

### Design System
Fonts: Playfair Display (headings), Inter (body text)
Colors: 
- Background: #f2f2f2
- Text: #333333, #666666 (secondary)
- Accent: #A6192E (McMaster maroon)
- White cards: #ffffff
- Borders: #e0e0e0, #dddddd

### Core Features (MVP)
1. **Course Catalog** - Browse/search all McMaster Engineering courses
2. **Reviews** - Submit and view course reviews with ratings, difficulty, workload
3. **Resources** - Upload/view study resources (videos, tools, practice problems, notes)
4. **Upvoting** - Users can upvote helpful resources
5. **Authentication** - Email verification required (@mcmaster.ca only)
6. **Filtering** - Filter resources by type, sort reviews by recency

### User Flows
**Primary Flow 1: Browse Course Info**
- Search/browse courses → View course page → Read reviews → Browse resources

**Primary Flow 2: Contribute Content**
- Sign up with @mcmaster.ca email → Verify email → Submit review OR add resource

### API Endpoints (Backend)
**Auth:**
- POST /auth/signup - Create account
- POST /auth/login - Get JWT token
- POST /auth/verify - Verify email token

**Courses:**
- GET /courses - List all courses (with search/filter)
- GET /courses/{id} - Get course details with aggregate stats

**Reviews:**
- GET /courses/{id}/reviews - Get reviews for a course
- POST /reviews - Submit a review (authenticated)

**Resources:**
- GET /courses/{id}/resources - Get resources for a course
- POST /resources - Add a resource (authenticated)
- POST /resources/{id}/upvote - Upvote a resource (authenticated)

### Security Requirements
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Email domain validation (@mcmaster.ca only)
- Input sanitization for XSS/SQL injection
- Rate limiting on API endpoints
- HTTPS in production
- Environment variables for secrets

### Development Timeline
**Week 1:** Database setup, basic CRUD, authentication flow
**Week 2:** Course pages, review submission/display
**Week 3:** Resource upload/display, upvoting system, filtering
**Week 4:** UI polish, bug fixes, deployment, README

### Success Metrics
- 50+ reviews across 20+ courses
- 100+ resources uploaded
- Site loads without errors
- Mobile-responsive
- 10+ real users during soft launch

### Future Enhancements (Post-MVP)
- AI-powered review summaries
- Semantic search for resources
- Professor profiles
- Resource collections/playlists
- Comments on resources
- "Helpful" voting on reviews
- Admin moderation dashboard
- Email notifications