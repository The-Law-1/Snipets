from ravendb import DocumentStore

store = DocumentStore('http://localhost:8082', 'SnippetsDB')

def init_store():
  store.initialize()