from fastapi import FastAPI
from db import init_store
from controllers.snippet_controller import create_snippet, get_snippets, delete_snippet

app = FastAPI()

init_store()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.post("/snippets/")(create_snippet)

app.get("/snippets/")(get_snippets)

app.delete("/snippets/{snippet_id}")(delete_snippet)