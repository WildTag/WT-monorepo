import base64
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from io import BytesIO

from db import prisma
from pydantic import BaseModel
from PIL import Image
from helpers.image_processing import get_exif
from typing import List

router = APIRouter()

@router.get("/posts", tags=["posts"])
async def user_list():
    posts = await prisma.picture.find_many(include={"uploader": True, "comments": True, "postTags": True})
    return posts

@router.get("/posts/{post_id}", tags=["posts"])
async def user_list(post_id: int):
    picture = await prisma.picture.find_first(where={"pictureId": post_id})
    return picture

class Imagetest(BaseModel):
    path: str

class CreatePostData(BaseModel):
    session_token: str
    animals: List[str]
    title: str
    description: str
    gps_long: float
    gps_lat: float
    images: List[Imagetest]
    
@router.post("/posts/create", tags=["users"])
async def create_post(session_token: str = Form(...), 
                      animals: List[str] = Form(...), 
                      title: str = Form(...), 
                      description: str = Form(...), 
                      gps_lat: float = Form(...), 
                      gps_long: float = Form(...), 
                      images: List[UploadFile] = Form(...)):
    user = await prisma.account.find_first(where={"accessToken": session_token})
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    
    image_bytes = None
    for image in images:
        image_bytes = await image.read()
    if not image_bytes: 
        raise HTTPException(
            status_code=400, detail="No image provided")
    
    post_tags = []
    for animal in animals:
        post_tags.append({"tag": animal.upper(), "tagType": "ANIMAL"})
    
    post = await prisma.picture.create(data={
        "image": base64.b64encode(image_bytes).decode(),
        "accountId": user.accountId,
        "title": title,
        "description": description,
        "GPSLong": gps_long,
        "GPSLat": gps_lat,
        "postTags": {
            "create": post_tags
        }
    },
    include={"uploader": True, "comments": True})

    return ({"detail": "Post has been created", "post": post})

@router.post("/posts/upload_image")
async def create_upload_file(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    image_type = file.content_type
    image = Image.open(BytesIO(image_bytes))

    status_code, data, image = get_exif(image, image_type)
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=data)
    
    return {"filename": file.filename, "metadata": data, "image": str(image)}
