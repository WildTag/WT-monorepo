from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class Request(BaseModel):
    status_code: int


@router.post("/test", tags=["test"])
async def status_code(request: Request):
    status_code = request.status_code
    if status_code == 200:
        return {"status": status_code, "message": "success"}
    elif status_code == 400:
        raise HTTPException(status_code=400, detail=f"bad request")
    elif status_code == 401:
        raise HTTPException(status_code=401, detail=f"unauthorized")
    elif status_code == 403:
        raise HTTPException(status_code=403, detail=f"forbidden")
    elif status_code == 404:
        raise HTTPException(status_code=404, detail=f"not found")
    else:
        raise HTTPException(status_code=500, detail=f"internal server error")
