from pydantic import BaseModel

class SerializedSnippet(BaseModel):
    Id: str | None = None
    text: str
    title: str
    url: str