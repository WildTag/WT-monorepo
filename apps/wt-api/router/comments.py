import base64
from fastapi import Form, HTTPException, Request
from db import prisma
from typing import List
from helpers.auth import verify_permission
from prisma.enums import Role


@router.post("/comment/create", tags=["comment"])
async def create_post(session_token: str = Form(...),
                      picture_id: int = Form(...),
                      comment_text: str = Form(...)):
    
    user = await prisma.account.find_first(where={"accessToken": session_token})
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    
    post = await prisma.comment.create(data={
        "pictureId": picture_id,
        "commenderAccountId": user.accountId,
        "commentText": comment_text,
    })

    return ({"detail": "Comment has been created.", "post": post})

@router.put("/comment/{comment_id}/edit", tags=["comment"])
async def create_post(comment_id: int,
                      request: Request,
                      session_token: str = Form(...),
                      comment_text: str = Form(...)):
    
    user = await prisma.account.find_first(where={"accessToken": session_token})
    comment = await prisma.comments.find_first(where={"commentId": comment_id})

    if user.accountId != comment.commenterAccountID:
        await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])
    
    post = await prisma.comments.update(where={"commentId": comment_id}, data={
        "commentText": comment_text,
    })

    return ({"detail": "Comment has been updated", "post": post})


@router.delete("/comment/{comment_id}/delete", tags=["comment"])
async def create_post(comment_id: int,
                      request: Request,
                      session_token: str = Form(...)):
    
    user = await prisma.account.find_first(where={"accessToken": session_token})
    comment = await prisma.comments.find_first(where={"commentId": comment_id})

    if user.accountId != comment.commenterAccountID:
        await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])

    post = await prisma.comments.delete(where={"commentId": comment_id})

    return ({"detail": "Comment has been deleted.", "post": post})