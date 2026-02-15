from models.snippet import Snippet
from sqlalchemy.orm import Session


class DeleteSnippet:
    def __init__(self, db: Session):
        self.db = db

    def delete(self, snippet_id: str, user_id: str) -> bool:
        snippet = (
            self.db.query(Snippet)
            .filter(Snippet.id == snippet_id, Snippet.user_id == user_id)
            .first()
        )
        if not snippet:
            return False

        self.db.delete(snippet)
        self.db.commit()
        return True
