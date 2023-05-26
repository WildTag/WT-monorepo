from fastapi import Request, APIRouter, HTTPException
from fastapi.responses import FileResponse
from db import prisma
from prisma.enums import Role
from helpers.auth import verify_permission
import csv
import io
import os

router = APIRouter()

@router.get("/data/{post_id}", tags=["admin"])
async def get_post_data(post_id: int, request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    post = await prisma.picture.find_first(
        where={"pictureId": post_id},
        include={
            "uploader": True,
            "postTags": True
        },
    )

    result = {
        "pictureId": post.pictureId,
        "username": post.uploader.username,
        "created": post.created,
        "title": post.title,
        "description": post.description,
        "GPSLong": post.GPSLong,
        "GPSLat": post.GPSLat,
        "reported": post.reported,
        "deleted": post.deleted,
        "tags": [{ "tag": tag.tag, "tagType": tag.tagType } for tag in post.postTags]
    }

    return result


def to_csv(data):
    output = io.StringIO()
    writer = csv.writer(output, delimiter='|')

    writer.writerow(data[0].keys())

    for row in data:
        row['tags'] = ', '.join([f"{tag['tag']}" for tag in row['tags']])
        writer.writerow(row.values())

    return output.getvalue()


@router.get("/data", tags=["admin"])
async def get_post_data(request: Request):
    await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

    posts = await prisma.picture.find_many(
        include={
            "uploader": True,
            "postTags": True
        },
    )

    if not posts:
        raise HTTPException(status_code=404, detail="No posts found")

    result_dictionary_array = []

    for post in posts:
        result = {
            "pictureId": post.pictureId,
            "username": post.uploader.username,
            "created": post.created,
            "title": post.title,
            "description": post.description,
            "GPSLong": post.GPSLong,
            "GPSLat": post.GPSLat,
            "reported": post.reported,
            "deleted": post.deleted,
            "tags": [{ "tag": tag.tag} for tag in post.postTags]
        }
        result_dictionary_array.append(result)

    csv_data = to_csv(result_dictionary_array)

    csv_filename = "WildTagData.csv"
    with open(csv_filename, "w", newline='', encoding='utf-8') as csv_file:
        csv_file.write(csv_data)

    if not os.path.exists(csv_filename):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(csv_filename, media_type="text/csv", filename=csv_filename)