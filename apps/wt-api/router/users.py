import uuid

from fastapi import APIRouter, HTTPException
from db import prisma
from pydantic import BaseModel

router = APIRouter()

@router.get("/users", tags=["users"])
async def user_list():
    users = await prisma.account.find_many()
    return users

@router.get("/users/{user_id}", tags=["users"])
async def get_user(user_id: int):
    print(1)
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

@router.get("/users/{session_token}", tags=["users"])
async def get_account_info(session_token: str):
    print(session_token)
    

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
    
    return {"detail": "Login successful", "session_token": user.access_token}