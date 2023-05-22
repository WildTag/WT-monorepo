
from fastapi import APIRouter
from db import prisma
from pydantic import BaseModel

router = APIRouter()

@router.get("/posts", tags=["posts"])
async def user_list():
    picture = await prisma.picture.find_many()
    return picture

@router.get("/posts/{post_id}", tags=["posts"])
async def user_list(post_id: int):
    picture = await prisma.picture.find_first(where={"pictureId": post_id})
    return picture

class CreatePostData(BaseModel):
    account_id: int
    title: str
    description: str
    gps_long : float
    gps_lat : float

@router.post("/posts/create", tags=["users"])
async def create_user(user_payload: CreatePostData):

    picture = await prisma.picture.create(data={
        "accountId": user_payload.account_id,
        "title": user_payload.title,
        "description": user_payload.description,
        "GPSLong": user_payload.gps_long,
        "GPSLat": user_payload.gps_lat
    })

    return ({"detail": "Post Creation Confirmed",
             "token": picture.title})