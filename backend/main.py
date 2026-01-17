from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import company, experience

app = FastAPI(
    title="MacEng Course Database API",
    description="API for McMaster Engineering course reviews and resources",
    version="1.0.0"
)

# CORS configuration to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(company.router, prefix="/api", tags=["companies"])
app.include_router(experience.router, prefix="/api", tags=["experience"])

@app.get("/")
async def root():
    return "MacEng Course Database API"

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
