import os
import hashlib

def generate_password_salt(): 
    seed = os.urandom(64)
    salt = hashlib.sha512(seed).hexdigest()
    
    return salt

def hash_password(password, salt):
    return hashlib.sha512(password.encode() + salt.encode()).hexdigest()

def has_numbers(input_string):
    return any(char.isdigit() for char in input_string)


def has_lowercase(input_string):
    return any(char.islower() for char in input_string)


def has_uppercase(input_string):
    return any(char.isupper() for char in input_string)


def has_specialchar(input_string):
    specialcharacters = "!@#$%^&*()-+?=,<>/:'\""
    return any(char in specialcharacters for char in input_string)
