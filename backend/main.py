from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import company, experience, user, company_request, design_team
from src.utils.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="MacEng Course Database API",
    description="API for McMaster Engineering course reviews and resources",
    version="1.0.0",
)

# Initialize Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration to allow frontend to communicate with backend
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://www.macengdb.ca,https://macengdb.ca",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(company.router, prefix="/api", tags=["companies"])
app.include_router(experience.router, prefix="/api", tags=["experience"])
app.include_router(user.router, prefix="/api/users", tags=["user"])
app.include_router(company_request.router, prefix="/api", tags=["company-requests"])
app.include_router(design_team.router, prefix="/api", tags=["design-teams"])


@app.get("/")
async def root():
    return "MacEng Course Database API"


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
