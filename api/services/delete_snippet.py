from db import store
from models.snippet import Snippet

class DeleteSnippet:
    def delete(self, snippet_id: str) -> bool:
        try:
            with store.open_session() as session:
                snippet = session.query(Snippet).get(snippet_id)
                if snippet:
                    session.delete(snippet)
                    session.commit()
                    return True
                return False
        except Exception as e:
            print(f"Error deleting snippet: {e}")
            return False
