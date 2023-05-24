from db import prisma
from prisma.enums import Role

async def create_default_admin():
    user = await prisma.account.find_first(where={"permission": Role.ADMINISTRATOR})

    if not user:
        await prisma.account.create(data={"username": "administrator", "passwordHash": "wildtag", "permission": Role.ADMINISTRATOR})
        print("====================================================================================================")
        print("====================================================================================================")
        print("Created administrator account. You can now log in with username: administrator and password: wildtag")
        print("====================================================================================================")
        print("====================================================================================================")