from domain.snippet import CreateSnippet
from fastapi import APIRouter, HTTPException, Depends, Query
from services.save_snippet import SaveSnippet
from services.get_snippets import GetSnippets
from services.delete_snippet import DeleteSnippet
from typing import Any
from domain.serialized_snippet import SerializedSnippet

def get_save_snippet_service() -> SaveSnippet:
    return SaveSnippet()

def get_get_snippets_service() -> GetSnippets:
    return GetSnippets()

def get_delete_snippet_service() -> DeleteSnippet:
    return DeleteSnippet()

async def create_snippet(snippet: CreateSnippet,
                         saveSnippet: SaveSnippet = Depends(get_save_snippet_service)) -> Any:
  try:
    result = saveSnippet.save(snippet)
    serialized_snippet = SerializedSnippet(**result.__dict__) if result else None
    return {"success": True, "data": serialized_snippet}
  except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))
  

async def get_snippets(    title: str = Query(None, description="Filter snippets by title"),

                       getSnippets: GetSnippets = Depends(get_get_snippets_service)) -> Any:
    try:
        if title:
            result = getSnippets.get_by_title(title)
        else:
            result = getSnippets.get_all()

        for snippet in result:
            print("Snippet results: ", snippet.created_at)
        serialized_snippets = [SerializedSnippet(**snippet.__dict__) for snippet in result]
        return {"success": True, "data": serialized_snippets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

async def delete_snippet(snippet_id: str,
                          deleteSnippet: DeleteSnippet = Depends(get_delete_snippet_service)) -> Any:
    try:
        result = deleteSnippet.delete(snippet_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))