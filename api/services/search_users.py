from sqlalchemy.orm import Session

from models.user import User


class SearchUsers:
    def __init__(self, db: Session):
        self.db = db

    def search(self, username: str):
        return (
            self.db.query(User)
            .filter(User.username.ilike(f"%{username}%"))
            .order_by(User.username.asc())
            .limit(10)
            .all()
        )
