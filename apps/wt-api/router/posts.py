
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from db import prisma
from pydantic import BaseModel
from PIL import Image
from helpers.image_processing import get_exif

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

# post/create

@router.post("/posts/upload_image")
async def create_upload_file(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    image_type = file.content_type
    image = Image.open(BytesIO(image_bytes))

    status_code, data = get_exif(image, image_type)
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=data)
    
    return {"filename": file.filename, "metadata": data}