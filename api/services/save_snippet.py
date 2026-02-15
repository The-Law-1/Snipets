from domain.snippet import CreateSnippet
from models.snippet import Snippet
from sqlalchemy.orm import Session


class SaveSnippet:
    def __init__(self, db: Session):
        self.db = db

    def save(self, snippet: CreateSnippet, user_id: str) -> Snippet:
        snippet_model = Snippet(
            text=snippet.text,
            title=snippet.title,
            url=snippet.url,
            user_id=user_id,
        )
        self.db.add(snippet_model)
        self.db.commit()
        self.db.refresh(snippet_model)
        return snippet_model
