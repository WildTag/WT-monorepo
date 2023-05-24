from fastapi import HTTPException, Request, APIRouter
from db import prisma
from helpers.auth import verify_permission
from prisma.enums import Role, LogType
from pydantic import BaseModel
from helpers.log_admin_action import insert_admin_log

router = APIRouter()

class CommentCreatePayload(BaseModel):
    picture_id: int
    comment_text: str

@router.post("/comments/create", tags=["comment"])
async def create_post(comment_create_payload: CommentCreatePayload, request: Request):
    if not comment_create_payload.picture_id:
        raise HTTPException(
            status_code=400, detail="Picture ID is required.")
    if not comment_create_payload.comment_text:
        raise HTTPException(
            status_code=400, detail="Comment content is required.")
        
    access_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": access_token})
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    
    post = await prisma.comment.create(data={
        "pictureId": comment_create_payload.picture_id,
        "commenterAccountId": user.accountId,
        "commentText": comment_create_payload.comment_text,
    })

    return ({"detail": "Comment has been created.", "post": post})

@router.put("/comments/{comment_id}/edit", tags=["comment"])
async def create_post(comment_id: int,
                      request: Request,
                      comment_text: str):
    access_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": access_token})
    comment = await prisma.comments.find_first(where={"commentId": comment_id})

    if user.accountId != comment.commenterAccountID:
        await verify_permission(access_token, [Role.Administrator, Role.Moderator])
        insert_admin_log(user.accountId, LogType.EDIT_COMMENT)
    
    post = await prisma.comments.update(where={"commentId": comment_id}, data={
        "commentText": comment_text,
    })

    return ({"detail": "Comment has been updated", "post": post})


@router.delete("/comments/{comment_id}/delete", tags=["comment"])
async def create_post(comment_id: int,
                      request: Request):
    user = await prisma.account.find_first(where={"accessToken": request.headers.get("Authorization")})
    comment = await prisma.comments.find_first(where={"commentId": comment_id})

    if user.accountId != comment.commenterAccountID:
        await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])
        insert_admin_log(user.accountId, LogType.DELETE_COMMENT)

    post = await prisma.comments.delete(where={"commentId": comment_id})

    return ({"detail": "Comment has been deleted.", "post": post})