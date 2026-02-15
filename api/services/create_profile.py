from sqlalchemy.orm import Session

from models.user import User


class CreateProfile:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, username: str) -> User:
        existing_username = self.db.query(User).filter(User.username == username).first()
        if existing_username:
            raise ValueError("username_taken")

        existing_user = self.db.query(User).filter(User.id == user_id).first()
        if existing_user:
            raise ValueError("profile_exists")

        user = User(id=user_id, username=username)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
