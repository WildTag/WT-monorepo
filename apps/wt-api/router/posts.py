
from http.client import HTTPException
from fastapi import APIRouter, UploadFile, File
from db import prisma
from pydantic import BaseModel
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
    session_token: str
    animals: List[str]
    title: str
    description: str
    gps_long: float
    gps_lat: float
    images: List[Image]
    
@router.post("/posts/create", tags=["users"])
async def create_user(user_payload: CreatePostData):
    user = await prisma.account.find_first(where={"accessToken": user_payload.session_token})
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    
    await prisma.picture.create(data={
        "accountId": user.accountId,
        "title": user_payload.title,
        "description": user_payload.description,
        "GPSLong": user_payload.gps_long,
        "GPSLat": user_payload.gps_lat
    })

    return ({"detail": "Post Creation Confirmed"})

@router.post("/posts/upload_image")
async def create_upload_file(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    # image/type.. eg image/png, image/jpeg...
    image_type = file.content_type
    
    # uncomment belowif you want to open the image (display it)
    # image = Image.open(BytesIO(image_bytes))
    # image.show()
    
    # TODO: peter add code to return meta data to client
    
    return {"filename": file.filename, "metadata": "..."}