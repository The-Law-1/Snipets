from typing import List

from models.snippet import Snippet
from sqlalchemy.orm import Session


class GetSnippets:
    def __init__(self, db: Session):
        self.db = db

    def get_by_title(self, user_id: str, title: str) -> List[Snippet]:
        return (
            self.db.query(Snippet)
            .filter(Snippet.user_id == user_id, Snippet.title.ilike(f"%{title}%"))
            .order_by(Snippet.created_at.desc())
            .limit(50)
            .all()
        )

    def get_all(self, user_id: str) -> List[Snippet]:
        return (
            self.db.query(Snippet)
            .filter(Snippet.user_id == user_id)
            .order_by(Snippet.created_at.desc())
            .limit(50)
            .all()
        )
