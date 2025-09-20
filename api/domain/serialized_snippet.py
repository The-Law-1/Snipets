from pydantic import BaseModel

from datetime import datetime

class SerializedSnippet(BaseModel):
    Id: str | None = None
    text: str
    title: str
    url: str
    created_at: datetime | None = None