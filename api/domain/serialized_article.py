from pydantic import BaseModel


class SerializedArticle(BaseModel):
    title: str
    url: str
    snippet_count: int
