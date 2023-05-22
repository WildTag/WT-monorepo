import json
import os
import uvicorn

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from helpers.try_int import try_int
from router import test, users, posts
from db import prisma

app = FastAPI()
app.include_router(test.router)
app.include_router(users.router)
app.include_router(posts.router)


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


if __name__ == "__main__":
    host = os.environ.get("HOST")
    port = try_int(os.environ.get("PORT"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
