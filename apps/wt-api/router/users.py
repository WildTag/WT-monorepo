import uuid
from fastapi import APIRouter, HTTPException, Request, Form
from pydantic import BaseModel
from db import prisma
from prisma.enums import Role, LogType
from helpers.log_admin_action import insert_admin_log
from helpers.auth import verify_permission
import base64


router = APIRouter()

@router.get("/users", tags=["users"])
async def user_list(request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.Moderator])

    users = await prisma.account.find_many()
    return users

@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.put("/users/{user_id}/ban", tags=["users"])
async def ban_user(user_id: int, request: Request):
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.Moderator])

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
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.Moderator])

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


@router.put("/users/{user_id}/edit", tags=["users"])
async def edit_user(request: Request,
                    user_id: int, 
                    role: Role,
                    password: str,
                    profile_image: str = Form(...)):
    
    access_token = request.headers.get("Authorization")
    requester = await prisma.account.find_first(where={"accessToken": access_token})
    user = await prisma.account.find_first(where={"accountId": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    image_bytes = None
    image_bytes = base64.b64decode(profile_image)

    if not image_bytes: 
        raise HTTPException(
            status_code=400, detail="No image provided")

    if user.accountId != requester.accountId:
        await verify_permission(access_token , [Role.ADMINISTRATOR, Role.Moderator])
        await insert_admin_log(requester.accountId, LogType.EDIT_ACCOUNT, account_id=user_id)
    
    await prisma.account.update(where={"accountId": user_id}, data={
        "Role": role,
        "passwordHash": password,
        "profileImage": base64.b64encode(image_bytes).decode()})

    return {"detail": "User has been updated", "user": user}


@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.get("/users/account/get", tags=["users"])
async def get_account_info(request: Request):
    authorization_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": authorization_token})
    return user
    

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

    user = await prisma.account.create(data={
        "username": user_payload.username,
        "email": user_payload.email,
        "passwordHash": user_payload.password,
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
        "passwordHash": login_payload.password
    })
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid login credentials")
        
    
    if user.banned:
        raise HTTPException(
            status_code=401, detail="This account has been banned")
    await prisma.account.update(where={
        "username": login_payload.username,
    }, data={"accessToken": access_token})
    
    return {"detail": "Login successful", "session_token": access_token}
