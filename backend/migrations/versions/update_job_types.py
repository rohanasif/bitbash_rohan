"""update job types

Revision ID: update_job_types
Create Date: 2024-04-16 16:22:34.123456

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = 'update_job_types'
down_revision = 'e5c6196bbfbd'
branch_labels = None
depends_on = None

def upgrade():
    # Create a connection
    conn = op.get_bind()

    # Update internship positions
    conn.execute(
        text("""
        UPDATE jobs
        SET job_type = 'Internship'
        WHERE LOWER(title) LIKE '%intern%'
        OR LOWER(title) LIKE '%internship%'
        """)
    )

    # Update contract positions
    conn.execute(
        text("""
        UPDATE jobs
        SET job_type = 'Contract'
        WHERE LOWER(title) LIKE '%contract%'
        OR LOWER(title) LIKE '%temporary%'
        OR LOWER(title) LIKE '%temp%'
        """)
    )

    # Update part-time positions
    conn.execute(
        text("""
        UPDATE jobs
        SET job_type = 'Part-time'
        WHERE LOWER(title) LIKE '%part time%'
        OR LOWER(title) LIKE '%part-time%'
        """)
    )

    # Update remote positions
    conn.execute(
        text("""
        UPDATE jobs
        SET job_type = 'Remote'
        WHERE LOWER(title) LIKE '%remote%'
        OR LOWER(location) LIKE '%remote%'
        """)
    )

    # Set remaining positions as Full-time (default)
    conn.execute(
        text("""
        UPDATE jobs
        SET job_type = 'Full-time'
        WHERE job_type IS NULL
        OR job_type = ''
        """)
    )

def downgrade():
    # Reset all job types to NULL
    conn = op.get_bind()
    conn.execute(text("UPDATE jobs SET job_type = NULL"))