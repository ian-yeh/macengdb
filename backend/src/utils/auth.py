from datetime import datetime
from types import SimpleNamespace

def get_current_user():
    """Mock user for testing - returns a simple object"""
    
    mock_user = SimpleNamespace(
        id=1,
        email="test@mcmaster.ca",
        name="Test User",
        program="Software",  # String is fine for mock
        graduation_year=2026,
        is_verified=True,
        supabase_user_id="mock-supabase-id",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    return mock_user
