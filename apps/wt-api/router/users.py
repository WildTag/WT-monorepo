import uuid
from fastapi import APIRouter, HTTPException, Request, Form
from pydantic import BaseModel
from db import prisma
from prisma.enums import Role, LogType
from helpers.log_admin_action import insert_admin_log
from helpers.auth import verify_permission
from helpers.password import generate_password_salt, hash_password
import base64


router = APIRouter()

@router.get("/users", tags=["users"])
async def user_list(request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    users = await prisma.account.find_many()
    return users

@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.get("/users/{user_id}/posts", tags=["users"])
async def get_user_posts(user_id: int):
    posts = await prisma.picture.find_many(where={"accountId": user_id},include={ "comments": True,},order={'pictureId': 'desc'})

    if not posts:
        raise HTTPException(status_code=404, detail="User has no posts or doesn't exist.")

    return posts

@router.put("/users/{user_id}/ban", tags=["users"])
async def ban_user(user_id: int, request: Request):
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    if requester.accountId == user_id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself")
    
    user = await prisma.account.find_first(where={"accountId": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.banned == True:
        raise HTTPException(status_code=400, detail="User is already banned")
    
    await prisma.account.update(where={"accountId": user_id}, data={"banned": True})
    await insert_admin_log(requester.accountId, LogType.BAN_ACCOUNT, account_id=user_id)
    return {"detail": "User has been banned", "user": user}

@router.put("/users/{user_id}/unban", tags=["users"])
async def ban_user(user_id: int, request: Request):
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    if requester.accountId == user_id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself")
    
    user = await prisma.account.find_first(where={"accountId": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.banned == False:
        raise HTTPException(status_code=400, detail="User is not banned.")
    
    await prisma.account.update(where={"accountId": user_id}, data={"banned": False, "accessToken": None})
    await insert_admin_log(requester.accountId, LogType.UNBAN_ACCOUNT, account_id=user_id)
    return {"detail": "User has been unbanned", "user": user}


class EditUserPayload(BaseModel):
    user_id: int
    username: str
    permission: Role = None
    password: str
    email: str
    
@router.put("/users/{user_id}/edit", tags=["users"])
async def edit_user(edit_user_payload: EditUserPayload, request: Request):
    access_token = request.headers.get("Authorization")
    requester = await prisma.account.find_first(where={"accessToken": access_token})
    user = await prisma.account.find_first(where={"accountId": edit_user_payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not requester:
        print(access_token)
        raise HTTPException(status_code=404, detail="Requester not found")

    if user.accountId != requester.accountId:
        await verify_permission(access_token , [Role.ADMINISTRATOR, Role.MODERATOR])
        await insert_admin_log(requester.accountId, LogType.EDIT_ACCOUNT, account_id=edit_user_payload.user_id)
    
    password_hash = hash_password(edit_user_payload.password, user.passwordSalt)
    
    if edit_user_payload.permission and requester.permission != "ADMINISTRATOR":
        raise HTTPException(status_code=403, detail="You cannot change user permissions")
    
    if not edit_user_payload.permission:
        edit_user_payload.permission = user.permission
    
    user = await prisma.account.update(where={"accountId": edit_user_payload.user_id}, data={
        "permission": edit_user_payload.permission,
        "passwordHash": password_hash,
        "email": edit_user_payload.email,
        "username": edit_user_payload.username,
    })

    return {"detail": "User has been updated", "user": user}


@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.get("/users/account/get", tags=["users"])
async def get_account_info(request: Request):
    authorization_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": authorization_token})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User found", "user": user}
    

class RegisterUserData(BaseModel):
    username: str
    password: str
    email: str
    profile_image: str = Form(...)

@router.post("/users/register", tags=["users"])
async def create_user(user_payload: RegisterUserData):
    if len(user_payload.username) < 1:
        raise HTTPException(
            status_code=400, detail="Username Length must be at least 1 character")
    if len(user_payload.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password length has to be >= 6")
    check_user = await prisma.account.find_first(
        where={
            "username": user_payload.username
        }
    )
    if check_user:
        raise HTTPException(
            status_code=400, detail="Username already exists")
    
    check_email = await prisma.account.find_first(
        where={
            "email": user_payload.email
        }
    )
    if check_email:
        raise HTTPException(
            status_code=400, detail="Email already exists")
    
    image_bytes = None
    image_bytes = base64.b64decode(user_payload.profile_image)
    if not image_bytes: 
        raise HTTPException(
            status_code=400, detail="No image provided")

    salt = generate_password_salt()
    password_hash = hash_password(user_payload.password, salt)

    user = await prisma.account.create(data={
        "username": user_payload.username,
        "email": user_payload.email,
        "passwordHash": password_hash,
        "passwordSalt": salt,
        "accessToken": str(uuid.uuid4()),
        "profileImage": base64.b64encode(image_bytes).decode()
    })

    return ({"detail": "Registration Confirmed",
             "access_token": user.accessToken})
    
class LoginUserData(BaseModel):
    username: str
    password: str

@router.post("/users/login", tags=["users"])
async def create_user(login_payload: LoginUserData):
    access_token = str(uuid.uuid4())

    user = await prisma.account.find_first(where={
        "username": login_payload.username,
    })

    password_hash = hash_password(login_payload.password, user.passwordSalt)

    if user.passwordHash != password_hash:
        raise HTTPException(
            status_code=401, detail="Invalid login credentials")
    
    if user.banned:
        raise HTTPException(
            status_code=401, detail="This account has been banned")
    await prisma.account.update(where={
        "username": login_payload.username,
    }, data={"accessToken": access_token})
    
    return {"detail": "Login successful", "session_token": access_token}
