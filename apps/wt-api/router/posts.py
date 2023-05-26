import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Query
from io import BytesIO
from db import prisma
from pydantic import BaseModel
from PIL import Image
from pillow_heif import register_heif_opener    # HEIF support
from helpers.image_processing import get_exif
from typing import List
from helpers.auth import verify_permission
from prisma.enums import Role, LogType
from typing import List, Optional
from datetime import datetime
from helpers.log_admin_action import insert_admin_log
from datetime import datetime
from helpers.convert_to_datetime import convert_to_datetime
from helpers.get_season import get_season

router = APIRouter()

"""

THIS FILE CONTAINS RELEVANT ENPOINTS FOR POST DATA SUBMITTED ON THE FRONT END AND TO PARSE ON THE FRONT END

"""


@router.get("/posts", tags=["posts"])
async def user_list(animals: Optional[List[str]] = Query(None), date_range: Optional[List[str]] = Query(None), season: Optional[str] = Query(None)):
    if animals:
        animals = [animal.strip() for animal in animals[0].split(",")]
    if date_range:
        date_range = [date.strip() for date in date_range[0].split(",")]
        date_range = [convert_to_datetime(date_str) for date_str in date_range]
        
    where_clause = {"deleted": False}
 
    if animals and animals[0]:
        animals = [animal.upper() for animal in animals]
        where_clause["postTags"] = {
            "some": {
                "tag": {
                    "in": animals
                }
            }
        }

    if date_range and len(date_range) == 2:
        date_range.sort()
        where_clause["created"] = {
            "gte": date_range[0],
            "lte": date_range[1]
        }
    posts = await prisma.picture.find_many(
        where=where_clause,
        include={
            "uploader": True, 
            "postTags": True,                                                                 
            "comments": {
                "include": {
                    "commenter": True
                }
            }
        }
    )

    if season:
        posts = [post for post in posts if get_season(post.created) == season]

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
    
@router.post("/posts/create", tags=["posts"])
async def create_post(session_token: str = Form(...),
                      animals: List[str] = Form(...),
                      title: str = Form(...),
                      description: str = Form(...),
                      gps_lat: float = Form(...),
                      gps_long: float = Form(...),
                      date_time_original: str = Form(...),
                      images: List[str] = Form(...)):
    title = ' '.join(title.strip().split())
    description = ' '.join(description.strip().split())
    
    if len(title) > 256:
        raise HTTPException(
            status_code=400, detail="Title must be less than 256 characters")
        
    if len(description) > 2048:
        raise HTTPException(
            status_code=400, detail="Description must be less than 2048 characters")
    
    user = await prisma.account.find_first(where={"accessToken": session_token})
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    
    image_bytes = None
    for image in images:
        image_bytes = base64.b64decode(image)
        
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
        },
        "created": convert_to_datetime(date_time_original),
    },
    include={"uploader": True, "comments": True, "postTags": True})

    return ({"detail": "Post has been created", "post": post})


@router.put("/posts/{post_id}/report", tags=["posts"])
async def create_post(post_id: int):
    post = await prisma.picture.find_first(where={"pictureId": post_id})

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    if post.deleted:
        raise HTTPException(status_code=400, detail="Post already deleted.")
    
    if post.reported:
        raise HTTPException(status_code=400, detail="Post already reported.")
    
    await prisma.picture.update(where={"pictureId": post_id}, data={"reported": True})

    return ({"detail": "Post has been reported"})

@router.put("/posts/{post_id}/report/clear", tags=["posts"])
async def create_post(post_id: int):
    post = await prisma.picture.find_first(where={"pictureId": post_id})

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    if post.deleted:
        raise HTTPException(status_code=400, detail="Post already deleted.")
    
    if not post.reported:
        raise HTTPException(status_code=400, detail="Post not reported.")
    
    await prisma.picture.update(where={"pictureId": post_id}, data={"reported": False})

    return ({"detail": "Report has been cleared."})    

class EditPostPayload(BaseModel):
    post_id: int
    animals: List[str]
    title: str
    description: str

@router.put("/posts/{post_id}/edit", tags=["posts"])
async def create_post(edit_post_payload: EditPostPayload, request: Request):
    if len(edit_post_payload.title) > 256:
        raise HTTPException(
            status_code=400, detail="Title must be less than 256 characters")
        
    if len(edit_post_payload.description) > 2048:
        raise HTTPException(
            status_code=400, detail="Description must be less than 2048 characters")
    
    access_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": access_token})
    post = await prisma.picture.find_first(where={"pictureId": edit_post_payload.post_id})
    
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid session token")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.accountId != user.accountId:
        await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])
        await insert_admin_log(user.accountId, LogType.POST_EDIT, picture_id=edit_post_payload.post_id)
        
    post_tags = []
    for animal in edit_post_payload.animals:
        post_tags.append({"tag": animal.upper(), "tagType": "ANIMAL"})
        
    await prisma.posttag.delete_many(where={"pictureId": edit_post_payload.post_id})
    
    post = await prisma.picture.update(where={"pictureId": edit_post_payload.post_id}, data={
        "accountId": user.accountId,
        "title": edit_post_payload.title,
        "description": edit_post_payload.description,
        "postTags": {
            "create": post_tags
        }
    }, include={"uploader": True, "comments": {
                "include": {
                    "commenter": True
                }
    }, "postTags": True})

    return ({"detail": "Post has been updated", "post": post})


@router.delete("/posts/{post_id}/delete", tags=["posts"])
async def create_post(post_id: int,
                      request: Request):
    access_token = request.headers.get("Authorization")
    user = await prisma.account.find_first(where={"accessToken": access_token})
    post = await prisma.picture.find_first(where={"pictureId": post_id})

    if post.accountId != user.accountId:
        await verify_permission(access_token , [Role.ADMINISTRATOR, Role.MODERATOR])
        await insert_admin_log(user.accountId, LogType.POST_DELETE, picture_id=post_id)

    post = await prisma.picture.update(where={"pictureId": post_id}, data={"deleted": True})

    return ({"detail": "Post has been deleted.", "post": post})

@router.post("/posts/upload_image")
async def create_upload_file(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_type = file.content_type
    
    register_heif_opener()
    image = Image.open(BytesIO(image_bytes))

    status_code, data, image, error_text = get_exif(image, image_type)

    if not error_text:
        detail_text = "Image uploaded."
        toast_colour = None
    else:
        detail_text = error_text
        toast_colour = "red"
    
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=data)

    if data["date_time_original"]:
        date_time_original = data["date_time_original"]
        data["date_time_original"] = datetime.strptime(date_time_original, "%Y:%m:%d %H:%M:%S").isoformat()
                
    return {"detail": detail_text, "image_data": {"filename": file.filename, "metadata": data, "image": image}, "color": toast_colour}
