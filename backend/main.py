from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import company, experience, user

app = FastAPI(
    title="MacEng Course Database API",
    description="API for McMaster Engineering course reviews and resources",
    version="1.0.0"
)

# CORS configuration to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(company.router, prefix="/api", tags=["companies"])
app.include_router(experience.router, prefix="/api", tags=["experience"])
app.include_router(user.router, prefix="/api/users", tags=["user"])

@app.get("/")
async def root():
    return "MacEng Course Database API"

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
