from controllers.articles_controller import get_articles
from controllers.snippet_controller import create_snippet, get_snippets, delete_snippet
from controllers.user_controller import create_profile
from controllers.social_controller import search_users, follow, get_feed
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db
import os

app = FastAPI()

# Allow requests from frontend, read from env FRONTEND_URL
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
extension_url = os.environ.get("EXTENSION_URL", "http://localhost:*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, extension_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.get("/")
def read_root():
    return {"Hello": "World"}


app.post("/snippets/")(create_snippet)
app.get("/snippets/")(get_snippets)
app.delete("/snippets/{snippet_id:path}")(delete_snippet)

app.get("/articles/")(get_articles)

app.post("/auth/profile/")(create_profile)

app.get("/users/search")(search_users)
app.post("/users/follow")(follow)
app.get("/feed")(get_feed)
