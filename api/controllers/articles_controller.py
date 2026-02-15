from domain.serialized_article import SerializedArticle
from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any

from auth import get_current_user_id
from db import get_db
from services.get_articles import GetArticles


def get_articles_service(db: Session = Depends(get_db)) -> GetArticles:
    return GetArticles(db)


async def get_articles(
    title: str = Query(None, description="Filter articles by title"),
    getArticles: GetArticles = Depends(get_articles_service),
    user_id: str = Depends(get_current_user_id),
) -> Any:
    try:
        if title:
            result = getArticles.get_by_title(user_id, title)
        else:
            result = getArticles.get_all(user_id)

        serialized_articles = [
            SerializedArticle(
                title=article.title,
                url=article.url,
                snippet_count=article.snippet_count,
            )
            for article in result
        ]
        return {"success": True, "data": serialized_articles}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
