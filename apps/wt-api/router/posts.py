
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from db import prisma
from pydantic import BaseModel
from PIL import Image
from helpers.image_processing import get_exif
from typing import List

router = APIRouter()

@router.get("/posts", tags=["posts"])
async def user_list():
    picture = await prisma.picture.find_many()
    return picture

@router.get("/posts/{post_id}", tags=["posts"])
async def user_list(post_id: int):
    picture = await prisma.picture.find_first(where={"pictureId": post_id})
    return picture

class Image(BaseModel):
    path: str

class CreatePostData(BaseModel):
    account_id: int
    animals: List[str]
    title: str
    description: str
    gps_long: float
    gps_lat: float
    images: List[Image]
    
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

@router.post("/posts/upload_image")
async def create_upload_file(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    image_type = file.content_type
    image = Image.open(BytesIO(image_bytes))

    status_code, data = get_exif(image, image_type)
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=data)
    
    return {"filename": file.filename, "metadata": data}