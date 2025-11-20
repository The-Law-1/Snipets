from models.snippet import Snippet
from db import store
from typing import List


class GetSnippets:
    def get_by_title(self, title: str) -> List[Snippet]:
        try:
            with store.open_session() as session:
                print(f"Searching for snippets with title containing: {title}")
                # ! space is taken as an end of query
                # todo: try escaping the spaces, or using the OR operator, cf ravendb docs
                snippets = list(
                    session.query_collection("Snippets")
                    .search("title", f"*{title}*")
                    .order_by_descending("created_at")
                )
                return snippets
        except Exception as e:
            print(f"Error retrieving snippets by title: {e}")
            return []

    def get_all(self) -> List[Snippet]:
        try:
            with store.open_session() as session:
                snippets = list(
                    session.query_collection("Snippets")
                    .order_by_descending("created_at")
                    .take(50)
                )
                return snippets
        except Exception as e:
            print(f"Error retrieving snippets: {e}")
            return []
