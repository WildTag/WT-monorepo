from fastapi import Request, APIRouter, HTTPException
from db import prisma
from prisma.enums import Role
from helpers.auth import verify_permission
import csv
import io

router = APIRouter()

@router.get("/data/{post_id}", tags=["admin"])
async def get_post_data(post_id: int, request: Request):
    #await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

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
    # Create a memory file
    output = io.StringIO()

    # Define CSV Writer with pipe delimiter
    writer = csv.writer(output, delimiter='|')

    # Write header
    writer.writerow(data[0].keys())

    # Write data rows
    for row in data:
        # Convert tags from list of dictionaries to string
        row['tags'] = ', '.join([f"{tag['tag']}" for tag in row['tags']])
        writer.writerow(row.values())

    # Return CSV data
    return output.getvalue()


@router.get("/data", tags=["admin"])
async def get_post_data(request: Request):
    #await verify_permission(request.headers.get("Authorization") , [Role.ADMINISTRATOR, Role.MODERATOR])

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

    return to_csv(result_dictionary_array)
