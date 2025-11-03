from domain.serialized_article import SerializedArticle
from services.get_articles import GetArticles
from fastapi import HTTPException, Depends, Query


from typing import Any


def get_articles_service() -> GetArticles:
    return GetArticles()


async def get_articles(
    title: str = Query(None, description="Filter articles by title"),
    getArticles: GetArticles = Depends(get_articles_service),
) -> Any:
    try:
        if title:
            result = getArticles.get_by_title(title)
        else:
            result = getArticles.get_all()

        serialized_articles = [
            SerializedArticle(**article.__dict__) for article in result
        ]
        return {"success": True, "data": serialized_articles}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
