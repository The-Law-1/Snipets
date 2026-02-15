from pydantic import BaseModel


class CreateProfile(BaseModel):
    username: str


class SerializedUser(BaseModel):
    id: str
    username: str
