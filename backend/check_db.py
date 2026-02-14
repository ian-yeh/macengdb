from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(db_url)
inspector = inspect(engine)

print("Tables in database:")
tables = inspector.get_table_names()
for table in tables:
    print(f"\nTable: {table}")
    columns = inspector.get_columns(table)
    for column in columns:
        print(f"  - {column['name']} ({column['type']})")

if "company_requests" in tables:
    print("\n[INFO] company_requests table exists.")
else:
    print("\n[INFO] company_requests table does NOT exist.")

if "experiences" in tables:
    columns = [c["name"] for c in inspector.get_columns("experiences")]
    if "status" in columns:
        print("[INFO] experiences.status column exists.")
    else:
        print("[INFO] experiences.status column does NOT exist.")
