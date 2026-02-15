from domain.snippet import CreateSnippet
from domain.serialized_snippet import SerializedSnippet
from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any

from auth import get_current_user_id
from db import get_db
from services.delete_snippet import DeleteSnippet
from services.get_snippets import GetSnippets
from services.save_snippet import SaveSnippet


def get_save_snippet_service(db: Session = Depends(get_db)) -> SaveSnippet:
    return SaveSnippet(db)


def get_snippets_service(db: Session = Depends(get_db)) -> GetSnippets:
    return GetSnippets(db)


def get_delete_snippet_service(db: Session = Depends(get_db)) -> DeleteSnippet:
    return DeleteSnippet(db)


async def create_snippet(
    snippet: CreateSnippet,
    saveSnippet: SaveSnippet = Depends(get_save_snippet_service),
    user_id: str = Depends(get_current_user_id),
) -> Any:
    try:
        result = saveSnippet.save(snippet, user_id)
        serialized_snippet = SerializedSnippet(
            id=result.id,
            text=result.text,
            title=result.title,
            url=result.url,
            created_at=result.created_at,
            user_id=result.user_id,
        )
        return {"success": True, "data": serialized_snippet}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def get_snippets(
    title: str = Query(None, description="Filter snippets by title"),
    getSnippets: GetSnippets = Depends(get_snippets_service),
    user_id: str = Depends(get_current_user_id),
) -> Any:
    try:
        if title:
            result = getSnippets.get_by_title(user_id, title)
        else:
            result = getSnippets.get_all(user_id)

        serialized_snippets = [
            SerializedSnippet(
                id=snippet.id,
                text=snippet.text,
                title=snippet.title,
                url=snippet.url,
                created_at=snippet.created_at,
                user_id=snippet.user_id,
            )
            for snippet in result
        ]
        return {"success": True, "data": serialized_snippets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def delete_snippet(
    snippet_id: str,
    deleteSnippet: DeleteSnippet = Depends(get_delete_snippet_service),
    user_id: str = Depends(get_current_user_id),
) -> Any:
    try:
        result = deleteSnippet.delete(snippet_id, user_id)
        return {"success": True, "deleted": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
