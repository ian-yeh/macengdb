# src/utils/seed.py
"""
Database seeding script.

Run this to populate the database with initial test data:
- 2 companies (Google, Apple)
- 2 experiences for each company
- 1 test user
"""

from sqlalchemy.orm import Session
from datetime import datetime

from src.utils.database import SessionLocal, engine
from src.models.user import UserModel, ProgramEnum
from src.models.company import CompanyModel
from src.models.experience import ExperienceModel
from src.utils.database import Base  # Import Base to create tables


def create_tables():
    """Create all database tables"""
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")


def seed_database():
    """Seed the database with initial test data"""
    db: Session = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        db.query(ExperienceModel).delete()
        db.query(CompanyModel).delete()
        db.query(UserModel).delete()
        db.commit()
        print("✓ Existing data cleared")
        
        # Create test user
        print("Creating test user...")
        test_user = UserModel(
            email="test@mcmaster.ca",
            name="Test User",
            program=ProgramEnum.SOFTWARE,
            graduation_year=2026,
            is_verified=True,
            supabase_user_id="test-user-id",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"✓ Created user: {test_user.name} (ID: {test_user.id})")
        
        # Create companies
        print("\nCreating companies...")
        
        google = CompanyModel(
            name="Google",
            industries=["Technology", "Cloud Computing", "AI"],
            rating=4.5,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        apple = CompanyModel(
            name="Apple",
            industries=["Technology", "Consumer Electronics", "Software"],
            rating=4.3,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(google)
        db.add(apple)
        db.commit()
        db.refresh(google)
        db.refresh(apple)
        print(f"✓ Created company: {google.name} (ID: {google.id})")
        print(f"✓ Created company: {apple.name} (ID: {apple.id})")
        
        # Create experiences for Google
        print("\nCreating experiences for Google...")
        
        google_exp1 = ExperienceModel(
            user_id=test_user.id,
            company_id=google.id,
            position="Software Engineering Intern",
            term="Summer 2025",
            offer_received=True,
            difficulty=4,
            stages=[
                {
                    "name": "Online Assessment",
                    "duration": "90 minutes",
                    "questions": [
                        "Two Sum",
                        "Longest Substring Without Repeating Characters",
                        "Merge Intervals"
                    ]
                },
                {
                    "name": "Phone Screen",
                    "duration": "45 minutes",
                    "questions": [
                        "Implement LRU Cache",
                        "Discuss previous projects"
                    ]
                },
                {
                    "name": "Virtual Onsite - Coding",
                    "duration": "45 minutes",
                    "questions": [
                        "Design a rate limiter",
                        "Serialize and deserialize binary tree"
                    ]
                },
                {
                    "name": "Virtual Onsite - Behavioral",
                    "duration": "30 minutes",
                    "questions": [
                        "Tell me about a time you failed",
                        "Why Google?"
                    ]
                }
            ],
            tips="Practice LeetCode mediums heavily. System design was focused on scalability. Be ready to discuss your projects in depth. The interviewers were very friendly!",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        google_exp2 = ExperienceModel(
            user_id=test_user.id,
            company_id=google.id,
            position="Product Management Intern",
            term="Fall 2024",
            offer_received=False,
            difficulty=3,
            stages=[
                {
                    "name": "Resume Screen",
                    "duration": None,
                    "questions": []
                },
                {
                    "name": "Phone Interview",
                    "duration": "30 minutes",
                    "questions": [
                        "Design a feature for Google Maps",
                        "How would you improve YouTube recommendations?"
                    ]
                },
                {
                    "name": "Case Study",
                    "duration": "60 minutes",
                    "questions": [
                        "Market sizing: TAM for smart home devices",
                        "Product strategy for entering a new market"
                    ]
                }
            ],
            tips="Really emphasize user empathy and data-driven decision making. They care a lot about metrics. Didn't get the offer but great learning experience.",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(google_exp1)
        db.add(google_exp2)
        db.commit()
        print(f"✓ Created experience: {google_exp1.position}")
        print(f"✓ Created experience: {google_exp2.position}")
        
        # Create experiences for Apple
        print("\nCreating experiences for Apple...")
        
        apple_exp1 = ExperienceModel(
            user_id=test_user.id,
            company_id=apple.id,
            position="Hardware Engineering Intern",
            term="Summer 2024",
            offer_received=True,
            difficulty=5,
            stages=[
                {
                    "name": "Phone Screen",
                    "duration": "45 minutes",
                    "questions": [
                        "Explain how transistors work",
                        "Design a circuit for LED dimming"
                    ]
                },
                {
                    "name": "Technical Interview 1",
                    "duration": "60 minutes",
                    "questions": [
                        "PCB layout best practices",
                        "Power consumption optimization"
                    ]
                },
                {
                    "name": "Technical Interview 2",
                    "duration": "60 minutes",
                    "questions": [
                        "Thermal management in compact devices",
                        "Battery charging circuitry"
                    ]
                },
                {
                    "name": "Behavioral",
                    "duration": "30 minutes",
                    "questions": [
                        "Describe a challenging project",
                        "How do you handle tight deadlines?"
                    ]
                }
            ],
            tips="Very technical and detail-oriented. They want to see deep hardware knowledge. Multiple rounds of technical interviews. Emphasize any hands-on experience with hardware projects.",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        apple_exp2 = ExperienceModel(
            user_id=test_user.id,
            company_id=apple.id,
            position="Machine Learning Engineer Intern",
            term="Winter 2025",
            offer_received=True,
            difficulty=4,
            stages=[
                {
                    "name": "Coding Challenge",
                    "duration": "120 minutes",
                    "questions": [
                        "Implement k-means clustering from scratch",
                        "Optimize neural network inference"
                    ]
                },
                {
                    "name": "ML System Design",
                    "duration": "60 minutes",
                    "questions": [
                        "Design a recommendation system for Apple Music",
                        "How would you detect fraudulent transactions?"
                    ]
                },
                {
                    "name": "Technical Deep Dive",
                    "duration": "45 minutes",
                    "questions": [
                        "Explain backpropagation",
                        "Trade-offs between different loss functions"
                    ]
                }
            ],
            tips="Strong focus on ML fundamentals and practical applications. They care about on-device ML and privacy. Be prepared to discuss model optimization for mobile devices.",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(apple_exp1)
        db.add(apple_exp2)
        db.commit()
        print(f"✓ Created experience: {apple_exp1.position}")
        print(f"✓ Created experience: {apple_exp2.position}")
        
        print("\n" + "="*50)
        print("✓ Database seeded successfully!")
        print("="*50)
        print(f"\nSummary:")
        print(f"  - Users: 1")
        print(f"  - Companies: 2 (Google, Apple)")
        print(f"  - Experiences: 4 (2 per company)")
        
    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Main function to run the seeding"""
    print("="*50)
    print("DATABASE SEEDING SCRIPT")
    print("="*50)
    print()
    
    create_tables()
    print()
    seed_database()


if __name__ == "__main__":
    main()
