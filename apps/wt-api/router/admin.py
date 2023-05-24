from fastapi import Request, APIRouter
from db import prisma
from prisma.enums import Role
from helpers.auth import verify_permission


router = APIRouter()

@router.get("/admin/logs", tags=["admin"])
async def user_list(request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    logs = await prisma.adminlog.find_many()
    return logs
