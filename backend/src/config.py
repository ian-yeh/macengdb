import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
import redis.asyncio as redis


class Settings(BaseSettings):
    # Base API settings
    PROJECT_NAME: str = "MacEngDB API"
    API_V1_STR: str = "/api"

    # Database settings (these should be in .env)
    DATABASE_URL: str = (
        "postgresql+psycopg2://user:password@localhost:5432/db"  # Example default
    )
    ASYNC_DATABASE_URL: str = (
        "postgresql+asyncpg://user:password@localhost:5432/db"  # Example default
    )

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"  # Default to local Redis

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache()
def get_settings():
    return Settings()


# Initialize Redis client (using async Redis for FastAPI)
# Make sure to handle connection in main.py startup/shutdown events
redis_client = redis.from_url(
    get_settings().REDIS_URL, encoding="utf-8", decode_responses=True
)


# Function to get Redis client for dependency injection (optional, direct import is often fine)
def get_redis_client():
    return redis_client
