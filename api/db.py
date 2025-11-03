from ravendb import DocumentStore

import os

raven_host = os.environ.get("RAVENDB_HOST", "localhost")
raven_port = os.environ.get("RAVENDB_PORT", "8082")

store = DocumentStore(f"http://{raven_host}:{raven_port}", "SnippetsDB")


def init_store():
    store.initialize()
