from db import prisma
from prisma.enums import Role
from typing import List
from fastapi import HTTPException

async def verify_permission(authorization_token: str, required_permissions: List[Role]):
    user = await prisma.account.find_first(where={"accessToken": authorization_token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session token")
    if user.permission not in required_permissions:
        raise HTTPException(status_code=401, detail="Invalid session token")
    return user