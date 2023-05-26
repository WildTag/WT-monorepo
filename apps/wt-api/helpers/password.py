import os
import hashlib

def generate_password_salt(): 
    seed = os.urandom(64)
    salt = hashlib.sha512(seed).hexdigest()
    return salt

def hash_password(password: str, salt: str):
    """
    hashes a password with a salt

    Args:
        password (str): the password to hash
        password (str): the salt to hash the password with

    Returns:
        _Hash: the hashed password
    """
    return hashlib.sha512(password.encode() + salt.encode()).hexdigest()

def has_numbers(input_string: str) -> bool:
    """
    checks if the input string contains numbers

    Args:
        input_string (str): the string to check

    Returns:
        bool: True if the string contains numbers, False otherwise
    """
    return any(char.isdigit() for char in input_string)

def has_lowercase(input_string: str) -> bool:
    """
    checks if the input string contains lowercase characters

    Args:
        input_string (str): the string to check

    Returns:
        bool: True if the string contains lowercase characters, False otherwise
    """
    return any(char.islower() for char in input_string)

def has_uppercase(input_string: str) -> bool:
    """
    checks if the input string contains uppercase characters

    Args:
        input_string (str): the string to check

    Returns:
        bool: True if the string contains uppercase characters, False otherwise
    """
    return any(char.isupper() for char in input_string)

def has_specialchar(input_string: str) -> bool:
    """
    checks if the input string contains special characters

    Args:
        input_string (str): the string to check

    Returns:
        bool: True if the string contains special characters, False otherwise
    """
    specialcharacters = "!@#$%^&*()-+?=,<>/:'\""
    return any(char in specialcharacters for char in input_string)
