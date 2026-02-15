from sqlalchemy.orm import Session
from sqlalchemy import desc

from models.follow import Follow
from models.snippet import Snippet
from models.user import User


class GetFeed:
    def __init__(self, db: Session):
        self.db = db

    def get_for_user(self, user_id: str):
        return (
            self.db.query(Snippet, User.username)
            .join(User, Snippet.user_id == User.id)
            .join(Follow, Follow.following_id == User.id)
            .filter(Follow.follower_id == user_id)
            .order_by(desc(Snippet.created_at))
            .limit(50)
            .all()
        )
