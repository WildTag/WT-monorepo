import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from db import prisma
from prisma.enums import Role
from helpers.auth import verify_permission

router = APIRouter()

@router.get("/users", tags=["users"])
async def user_list(request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])

    users = await prisma.account.find_many()
    return users

@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.put("/users/{user_id}/ban", tags=["users"])
async def ban_user(user_id: int, request: Request):
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])

    if requester.accountId == user_id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself")
    
    user = await prisma.account.find_first(where={"accountId": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.banned == True:
        raise HTTPException(status_code=400, detail="User is already banned")
    
    await prisma.account.update(where={"accountId": user_id}, data={"banned": True})
    return {"detail": "User has been banned", "user": user}

@router.put("/users/{user_id}/unban", tags=["users"])
async def ban_user(user_id: int, request: Request):
    requester =  await verify_permission(request.headers.get("Authorization") , [Role.Administrator, Role.Moderator])

    if requester.accountId == user_id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself")
    
    user = await prisma.account.find_first(where={"accountId": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.banned == False:
        raise HTTPException(status_code=400, detail="User is not banned.")
    
    await prisma.account.update(where={"accountId": user_id}, data={"banned": False})
    return {"detail": "User has been banned", "user": user}

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

    user = await prisma.account.create(data={
        "username": user_payload.username,
        "email": user_payload.email,
        "passwordHash": user_payload.password,
        "accessToken": str(uuid.uuid4())
    })

    return ({"detail": "Registration Confirmed",
             "access_token": user.accessToken})
    
class LoginUserData(BaseModel):
    username: str
    password: str

@router.post("/users/login", tags=["users"])
async def create_user(login_payload: LoginUserData):
    user = await prisma.account.find_first(where={
        "username": login_payload.username,
        "passwordHash": login_payload.password
    })
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid login credentials")
    print(user.banned)
    if user.banned:
        raise HTTPException(
            status_code=401, detail="This account has been banned")
    
    return {"detail": "Login successful", "session_token": user.accessToken}
