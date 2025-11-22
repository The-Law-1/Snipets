from models.snippet import Snippet
from db import store
from typing import List

from ravendb.documents.queries.misc import SearchOperator


class GetSnippets:
    def get_by_title(self, title: str) -> List[Snippet]:
        try:
            with store.open_session() as session:
                split_title = title.split(" ")
                wildcard_query = "".join([f"*{word}* " for word in split_title]).strip()
                snippets = list(
                    session.query_collection("Snippets")
                    .search("title", wildcard_query, operator=SearchOperator.AND)
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
