"""fix_schema_sync

Revision ID: 9f2b3c4d5e6f
Revises: 875eb32acd28
Create Date: 2026-02-13 23:45:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = "9f2b3c4d5e6f"
down_revision: Union[str, Sequence[str], None] = "875eb32acd28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()

    # Handle company_requests table
    if "company_requests" not in tables:
        op.create_table(
            "company_requests",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("requester_email", sa.String(length=255), nullable=True),
            sa.Column(
                "status", sa.String(length=20), nullable=False, server_default="pending"
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_company_requests_id"), "company_requests", ["id"], unique=False
        )
    else:
        # Table exists, check for missing requester_email column
        columns = [c["name"] for c in inspector.get_columns("company_requests")]
        if "requester_email" not in columns:
            op.add_column(
                "company_requests",
                sa.Column("requester_email", sa.String(length=255), nullable=True),
            )

    # Handle experiences.status column
    if "experiences" in tables:
        columns = [c["name"] for c in inspector.get_columns("experiences")]
        if "status" not in columns:
            op.add_column(
                "experiences",
                sa.Column(
                    "status",
                    sa.String(length=20),
                    nullable=False,
                    server_default="pending",
                ),
            )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()

    # Remove status column from experiences
    if "experiences" in tables:
        columns = [c["name"] for c in inspector.get_columns("experiences")]
        if "status" in columns:
            op.drop_column("experiences", "status")

    # Drop company_requests table
    if "company_requests" in tables:
        op.drop_index(op.f("ix_company_requests_id"), table_name="company_requests")
        op.drop_table("company_requests")
