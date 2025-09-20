
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_store
from controllers.snippet_controller import create_snippet, get_snippets, delete_snippet

app = FastAPI()


import os
# Allow requests from frontend, read from env FRONTEND_URL
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

init_store()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.post("/snippets/")(create_snippet)

app.get("/snippets/")(get_snippets)

app.delete("/snippets/{snippet_id:path}")(delete_snippet)