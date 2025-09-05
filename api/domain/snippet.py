from pydantic import BaseModel

class CreateSnippet(BaseModel):
    text: str
    title: str
    url: str