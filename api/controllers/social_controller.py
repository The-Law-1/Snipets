from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session

from auth import get_current_user_id
from db import get_db, SessionLocal
from services.follow_user import FollowUser
from services.search_users import SearchUsers
from services.get_feed import GetFeed
from domain.serialized_snippet import SerializedSnippet


async def search_users(q: str = Query(...)):
    db = SessionLocal()
    try:
        service = SearchUsers(db)
        users = service.search(q)
        return {
            "success": True,
            "data": [{"id": u.id, "username": u.username} for u in users],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


async def follow(
    username: str = Query(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    try:
        service = FollowUser(db)
        service.follow(user_id, username)
        return {"success": True, "message": f"Now following {username}"}
    except ValueError as e:
        if str(e) == "user_not_found":
            raise HTTPException(status_code=404, detail="User not found")
        elif str(e) == "cannot_follow_self":
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def get_feed(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    try:
        service = GetFeed(db)
        rows = service.get_for_user(user_id)
        items = [
            {
                "snippet": SerializedSnippet(
                    id=row.Snippet.id,
                    text=row.Snippet.text,
                    title=row.Snippet.title,
                    url=row.Snippet.url,
                    created_at=row.Snippet.created_at,
                    user_id=row.Snippet.user_id,
                    username=row.username,
                ).model_dump()
            }
            for row in rows
        ]
        return {"success": True, "data": items}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
