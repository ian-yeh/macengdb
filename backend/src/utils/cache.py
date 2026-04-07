import json
from functools import wraps
from typing import Callable, Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from ..config import get_redis_client  # or directly import redis_client
import hashlib

# Redis client instance
redis_client = get_redis_client()


def _generate_cache_key(prefix: str, request: Request, *args, **kwargs) -> str:
    """Generates a unique cache key based on the request and function arguments."""
    path = request.url.path
    query_params = sorted([(k, v) for k, v in request.query_params.items()])
    path_params = sorted([(k, str(v)) for k, v in request.path_params.items()])

    # Exclude Request and Response objects from kwargs to avoid serialization issues
    func_kwargs = {
        k: str(v) for k, v in kwargs.items() if k not in ["request", "response"]
    }
    sorted_func_kwargs = sorted(func_kwargs.items())

    # Combine all parts into a string for hashing
    key_parts_for_hash = [path]  # Only path and parameters for the hash
    if query_params:
        key_parts_for_hash.append("?".join([f"{k}={v}" for k, v in query_params]))
    if path_params:
        key_parts_for_hash.append("_".join([f"{k}={v}" for k, v in path_params]))
    if sorted_func_kwargs:
        key_parts_for_hash.append("_".join([f"{k}={v}" for k, v in sorted_func_kwargs]))

    full_key_hash = hashlib.md5(
        ":".join(key_parts_for_hash).encode("utf-8")
    ).hexdigest()
    # Prepend the human-readable prefix to the hashed part for easier invalidation with patterns
    return f"cache:{prefix}:{full_key_hash}"


def cache(
    key_prefix: str,
    ttl: int = 300,  # Default TTL of 5 minutes
    invalidate_prefixes: Optional[
        list[str]
    ] = None,  # List of cache key prefixes to invalidate
):
    """
    Decorator for caching FastAPI endpoint responses in Redis.

    Args:
        key_prefix (str): A prefix for the cache key, e.g., "companies".
        ttl (int): Time-to-live for the cache entry in seconds.
        invalidate_prefixes (list[str], optional): List of cache key prefixes to invalidate
                                            when this endpoint is accessed (typically for mutations).
    """

    def decorator(func: Callable[..., Any]):
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Request = kwargs.get("request")
            # If request is not in kwargs, try to find it in args (e.g., if it's the first arg)
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request is None:
                raise ValueError(
                    "Request object not found in function arguments. Ensure the endpoint has `request: Request` parameter."
                )

            # Remove request from kwargs to avoid passing it twice to _generate_cache_key
            kwargs_without_request = {k: v for k, v in kwargs.items() if k != "request"}

            # Handle cache invalidation for non-GET requests (e.g., POST, PUT, DELETE, PATCH)
            if request.method != "GET":
                if invalidate_prefixes:
                    for prefix in invalidate_prefixes:
                        keys_to_delete = []
                        # Scan for keys starting with the logical prefix
                        async for key in redis_client.scan_iter(f"cache:{prefix}:*"):
                            keys_to_delete.append(key)
                        if keys_to_delete:
                            await redis_client.delete(*keys_to_delete)
                            print(
                                f"Invalidated cache keys with prefix pattern: cache:{prefix}:*"
                            )
                # For non-GET requests, just execute the function and return its result
                return await func(*args, **kwargs)

            # For GET requests, try to serve from cache
            cache_key = _generate_cache_key(
                key_prefix, request, *args, **kwargs_without_request
            )
            cached_response = await redis_client.get(cache_key)

            if cached_response:
                print(f"Cache hit for key: {cache_key}")
                return JSONResponse(content=json.loads(cached_response))

            print(f"Cache miss for key: {cache_key}. Executing endpoint.")

            # Execute the original function to get the result
            # The result could be a dict/list (which FastAPI converts to JSONResponse)
            # or an actual FastAPI/Starlette Response object.
            result = await func(*args, **kwargs)

            # If the result is a JSONResponse (or is converted to one by FastAPI)
            # we need to ensure we can get its content for caching.
            # If it's a dict or list, we can cache it directly.
            cacheable_content = None
            if isinstance(result, (dict, list)):
                cacheable_content = result
            elif isinstance(result, JSONResponse):
                # If it's already a JSONResponse, extract its content
                cacheable_content = json.loads(result.body.decode("utf-8"))
            elif isinstance(result, Response):  # Handle generic Starlette Response
                # For generic Response, assume content is text/json if it can be decoded
                # Note: This might not be robust for all Response types (e.g., FileResponse)
                try:
                    content_str = result.body.decode("utf-8")
                    cacheable_content = json.loads(content_str)
                except (UnicodeDecodeError, json.JSONDecodeError):
                    print(
                        f"Warning: Generic Response for key {cache_key} not decodable as JSON/UTF-8. Not caching."
                    )

            if cacheable_content is not None:
                await redis_client.setex(cache_key, ttl, json.dumps(cacheable_content))
            else:
                print(
                    f"Warning: Result for key {cache_key} is not a dict, list, JSONResponse, or decodable generic Response. Not caching."
                )

            return result

        return wrapper

    return decorator


# --- Helper functions for more granular invalidation if needed directly ---
async def invalidate_cache_by_pattern(pattern: str):
    """Invalidates cache keys matching a given pattern (e.g., "cache:companies:*")."""
    keys_to_delete = []
    async for key in redis_client.scan_iter(pattern):
        keys_to_delete.append(key)
    if keys_to_delete:
        await redis_client.delete(*keys_to_delete)
        print(f"Explicitly invalidated cache keys matching pattern: {pattern}")
