from domain.snippet import CreateSnippet

from models.snippet import Snippet
from db import store

class SaveSnippet:
    # * should take a "createSnippet" domain object, call a repo, and return a "Snippet" domain object
    def save(self, snippet: CreateSnippet) -> Snippet:        
        try:
            with store.open_session() as session:
                snippet_model = Snippet(**snippet.dict())
                session.store(snippet_model)
                session.save_changes()
                return snippet_model
        except Exception as e:
            print(f"Error saving snippet: {e}")
            raise e