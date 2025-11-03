from db import store
from models.snippet import Snippet


class DeleteSnippet:
    def delete(self, snippet_id: str) -> bool:
        try:
            with store.open_session() as session:
                session.delete(snippet_id)
                session.save_changes()
                return True
        except Exception as e:
            print(f"Error deleting snippet: {e}")
            return False
