from sqlalchemy.orm import Session

from models.follow import Follow
from models.user import User


class FollowUser:
    def __init__(self, db: Session):
        self.db = db

    def follow(self, follower_id: str, username: str) -> Follow:
        target = self.db.query(User).filter(User.username == username).first()
        if not target:
            raise ValueError("user_not_found")
        if target.id == follower_id:
            raise ValueError("cannot_follow_self")

        existing = (
            self.db.query(Follow)
            .filter(Follow.follower_id == follower_id, Follow.following_id == target.id)
            .first()
        )
        if existing:
            return existing

        follow = Follow(follower_id=follower_id, following_id=target.id)
        self.db.add(follow)
        self.db.commit()
        self.db.refresh(follow)
        return follow
