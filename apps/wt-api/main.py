import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from helpers.try_int import try_int
from helpers.create_administrator_firstrun import create_default_admin
from router import test, users, posts, comments, admin, data
from db import prisma

app = FastAPI()
app.include_router(test.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(admin.router)
app.include_router(data.router)


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await prisma.connect()
    await create_default_admin() # Create default administrator account if it doesn't exist


if __name__ == "__main__":
    host = os.environ.get("HOST")
    port = try_int(os.environ.get("PORT"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
