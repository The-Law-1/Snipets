from models.snippet import Snippet
from db import store
from typing import List

class GetSnippets:
    def get_by_title(self, title: str) -> List[Snippet]:
        try:
            with store.open_session() as session:
                snippets = list(session.query_collection("Snippets").where_equals("title", title))
                return snippets
        except Exception as e:
            print(f"Error retrieving snippets by title: {e}")
            return []

    def get_all(self) -> List[Snippet]:
        try:
            with store.open_session() as session:
                snippets = list(session.query_collection("Snippets"))
                return snippets
        except Exception as e:
            print(f"Error retrieving snippets: {e}")
            return []