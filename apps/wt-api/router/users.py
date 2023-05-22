import uuid

from helpers.try_int import try_int
from fastapi import APIRouter, HTTPException, Request
from typing import Annotated
from db import prisma
from pydantic import BaseModel
from helpers.password import has_numbers, has_lowercase, has_uppercase, has_specialchar

router = APIRouter()

@router.get("/users", tags=["users"])
async def user_list():
    users = await prisma.account.find_many()
    return users

@router.get("/users/{user_id}", tags=["users"])
async def user_list(user_id: int):
    user = await prisma.account.find_first(where={"accountId": user_id})
    return user

class CreateUserData(BaseModel):
    username: str
    password: str
    email: str

@router.post("/users/create", tags=["users"])
async def create_user(user_payload: CreateUserData):
    if len(user_payload.username) < 1:
        raise HTTPException(
            status_code=400, detail="Username Length must be at least 1 character")
    if len(user_payload.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password length has to be >= 6")
    elif has_numbers(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a numeric value")
    elif has_lowercase(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a lowercase value")
    elif has_uppercase(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a uppercase value")
    elif has_specialchar(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a special character")

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
        "passwordHash": user_payload.password
    })

    return ({"detail": "Registration Confirmed",
             "token": user.username})