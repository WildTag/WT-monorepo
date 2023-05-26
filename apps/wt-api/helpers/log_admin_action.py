from db import prisma
from prisma.enums import LogType


async def insert_admin_log(performed_by_user_id: int, type: LogType, picture_id: int = None, account_id: int = None) -> None:
    """
    inserts an admin log into the database

    Args:
        performed_by_user_id (int): the id of the user who performed the action
        type (LogType): the type of action that was performed
        picture_id (int, optional): the id of the picture that was affected by the action. Defaults to None.
        account_id (int, optional): the id of the account that was affected by the action. Defaults to None.

    Returns:
        None
    """
    print(324234)
    await prisma.adminlog.create(data={
        "performedByUserId": performed_by_user_id,
        "type": type,
        "pictureId": picture_id,
        "accountId": account_id,
    })