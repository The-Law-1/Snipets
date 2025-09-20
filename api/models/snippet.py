class Snippet:
    collection = "Snippets"  # RavenDB collection name

    def __init__(self, text: str, title: str, url: str, Id: str = None, created_at=None):
        self.Id = Id
        self.text = text
        self.title = title
        self.url = url
        self.created_at = created_at