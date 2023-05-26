from db import prisma
from prisma.enums import Role
from typing import List
from fastapi import HTTPException
from prisma.models import Account

async def verify_permission(authorization_token: str, required_permissions: List[Role]) -> Account:
    """
    Verifies the permission level of the requester, raises an error if the user does not have one one of the required permissions.

    Args:
        authorization_token (str): the session token of the user

    Returns:
        user: Account
        
    Raises:
        HTTPException: 401 response for unauthorized access
    """
    user = await prisma.account.find_first(where={"accessToken": authorization_token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session token")
    if user.permission not in required_permissions:
        raise HTTPException(status_code=401, detail="Invalid session token")
    return user