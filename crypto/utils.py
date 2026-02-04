import base64
import os
import random
import string

def to_base64(data: bytes) -> str:
    """Convert bytes to Base64 string."""
    return base64.b64encode(data).decode('utf-8')

def from_base64(data: str) -> bytes:
    """Convert Base64 string to bytes."""
    try:
        return base64.b64decode(data.encode('utf-8'))
    except Exception:
        raise ValueError("Invalid Base64 input")

def generate_random_bytes(length: int) -> bytes:
    """Generate random bytes securely."""
    return os.urandom(length)

def generate_random_string_key(length: int = 16) -> str:
    """Generate a random string key (alphanumeric)."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))
