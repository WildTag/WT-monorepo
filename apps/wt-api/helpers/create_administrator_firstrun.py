from db import prisma
from prisma.enums import Role
from helpers.password import hash_password, generate_password_salt

async def create_default_admin():
    user = await prisma.account.find_first(where={"permission": Role.ADMINISTRATOR})

    default_password = "wildtag"
    password_salt = generate_password_salt()
    password_hash = hash_password(default_password, password_salt)

    if not user:
        await prisma.account.upsert(where={"username": "administrator"},
                                    data={"create": {"username": "administrator", "passwordHash": password_hash, "passwordSalt": password_salt, "permission": Role.ADMINISTRATOR},
                                          "update": {"username": "administrator", "passwordHash": password_hash, "passwordSalt": password_salt, "permission": Role.ADMINISTRATOR}})
        print("====================================================================================================")
        print("====================================================================================================")
        print(f"Created administrator account. You can now log in with username: administrator and password: {default_password}")
        print("====================================================================================================")
        print("====================================================================================================")
    