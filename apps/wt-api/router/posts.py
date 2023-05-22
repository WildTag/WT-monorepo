
from io import BytesIO
from fastapi import APIRouter, UploadFile, File
from db import prisma
from pydantic import BaseModel
from PIL import Image


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
    
    # image/type.. eg image/png, image/jpeg...
    image_type = file.content_type
    
    # uncomment belowif you want to open the image (display it)
    # image = Image.open(BytesIO(image_bytes))
    # image.show()
    
    # TODO: peter add code to return meta data to client
    
    return {"filename": file.filename, "metadata": "..."}