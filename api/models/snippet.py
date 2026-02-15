from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from db import Base


class Snippet(Base):
    __tablename__ = "snippets"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    user = relationship("User", back_populates="snippets")
