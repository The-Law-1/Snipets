from domain.user import CreateProfile
from fastapi import Depends, HTTPException

from auth import get_current_user_id
from db import get_db
from services.create_profile import CreateProfile as CreateProfileService
from sqlalchemy.orm import Session


async def create_profile(
    profile_data: CreateProfile,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    try:
        service = CreateProfileService(db)
        user = service.create(user_id, profile_data.username)
        return {"success": True, "user": {"id": user.id, "username": user.username}}
    except ValueError as e:
        if str(e) == "username_taken":
            raise HTTPException(status_code=409, detail="Username already taken")
        elif str(e) == "profile_exists":
            raise HTTPException(status_code=409, detail="Profile already exists")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
