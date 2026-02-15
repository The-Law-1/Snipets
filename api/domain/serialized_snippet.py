from pydantic import BaseModel

from datetime import datetime


class SerializedSnippet(BaseModel):
    id: str
    text: str
    title: str
    url: str | None = None
    created_at: datetime | None = None
    user_id: str | None = None
    username: str | None = None
