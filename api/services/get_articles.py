from models.snippet import Snippet
from db import store
from typing import List
from ravendb.documents.queries.misc import SearchOperator


class Article:
    title: str
    url: str
    snippet_count: int

    def __init__(self, title: str, count: int, url: str):
        self.title = title
        self.url = url
        self.snippet_count = count


class GetArticles:
    def get_by_title(self, title: str) -> List[Article]:
        try:
            with store.open_session() as session:
                results = list(
                    session.query(object_type=Snippet)
                    .search("title", title, operator=SearchOperator.AND)
                    .group_by("title", "url")
                    .select_key("title", "title")
                    .select_key("url", "url")
                    .select_count()
                    .of_type(Article)
                )
                return results
        except Exception as e:
            print(f"Error retrieving articles by title: {e}")
            return []

    def get_all(self) -> List[Article]:
        try:
            with store.open_session() as session:
                results = list(
                    session.query(object_type=Snippet)
                    .group_by("title", "url")
                    .select_key("title", "title")
                    .select_key("url", "url")
                    .select_count()
                    .of_type(Article)
                )
                return results
        except Exception as e:
            print(f"Error retrieving all articles: {e}")
            return []
