from typing import List

from models.snippet import Snippet
from sqlalchemy import func
from sqlalchemy.orm import Session


class Article:
    title: str
    url: str
    snippet_count: int

    def __init__(self, title: str, url: str, snippet_count: int):
        self.title = title
        self.url = url
        self.snippet_count = snippet_count


class GetArticles:
    def __init__(self, db: Session):
        self.db = db

    def get_by_title(self, user_id: str, title: str) -> List[Article]:
        rows = (
            self.db.query(
                Snippet.title,
                Snippet.url,
                func.count(Snippet.id).label("snippet_count"),
            )
            .filter(Snippet.user_id == user_id, Snippet.title.ilike(f"%{title}%"))
            .group_by(Snippet.title, Snippet.url)
            .order_by(func.count(Snippet.id).desc())
            .all()
        )
        return [Article(row.title, row.url, row.snippet_count) for row in rows]

    def get_all(self, user_id: str) -> List[Article]:
        rows = (
            self.db.query(
                Snippet.title,
                Snippet.url,
                func.count(Snippet.id).label("snippet_count"),
            )
            .filter(Snippet.user_id == user_id)
            .group_by(Snippet.title, Snippet.url)
            .order_by(func.count(Snippet.id).desc())
            .all()
        )
        return [Article(row.title, row.url, row.snippet_count) for row in rows]
