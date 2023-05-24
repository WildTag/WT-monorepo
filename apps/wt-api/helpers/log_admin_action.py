from db import prisma
from prisma.enums import LogType


async def insert_admin_log(performed_by_user_id: int, type: LogType, picture_id: int = None, account_id: int = None):
    
    await prisma.admin_logs.create(data={
        "performedByUserId": performed_by_user_id,
        "type": type,
        "pictureId": picture_id,
        "accountId": account_id,
    })