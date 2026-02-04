import random
from .utils import to_base64, from_base64

def caesar_encrypt(plaintext: str, shift: int) -> dict:
    if not 0 <= shift <= 25:
        raise ValueError("Shift must be between 0 and 25")
    
    result = []
    for char in plaintext:
        if char.isalpha():
            start = ord('A') if char.isupper() else ord('a')
            shifted = chr(start + (ord(char) - start + shift) % 26)
            result.append(shifted)
        else:
            result.append(char)
            
    ciphertext = "".join(result)
    return {
        "ciphertext": to_base64(ciphertext.encode('utf-8')),
        "key": to_base64(str(shift).encode('utf-8')),
        "meta": {}
    }

def caesar_decrypt(ciphertext_b64: str, shift: int) -> str:
    # Caesar ciphertext is usually treated as string, but we stick to the b64 input convention
    try:
        ct_bytes = from_base64(ciphertext_b64)
        ciphertext = ct_bytes.decode('utf-8')
    except:
        raise ValueError("Invalid Base64 ciphertext")

    if not 0 <= shift <= 25:
        raise ValueError("Shift must be between 0 and 25")
        
    result = []
    for char in ciphertext:
        if char.isalpha():
            start = ord('A') if char.isupper() else ord('a')
            # shift back
            shifted = chr(start + (ord(char) - start - shift) % 26)
            result.append(shifted)
        else:
            result.append(char)
    return "".join(result)

def monoalphabetic_encrypt(plaintext: str, key: str) -> dict:
    key = key.upper()
    if len(key) != 26 or len(set(key)) != 26 or not key.isalpha():
        raise ValueError("Key must be a permutation of 26 unique English letters")
    
    mapping_upper = {chr(ord('A') + i): key[i] for i in range(26)}
    mapping_lower = {chr(ord('a') + i): key[i].lower() for i in range(26)}
    
    result = []
    for char in plaintext:
        if char.isupper():
            result.append(mapping_upper.get(char, char))
        elif char.islower():
            result.append(mapping_lower.get(char, char))
        else:
            result.append(char)
            
    ciphertext = "".join(result)
    return {
        "ciphertext": to_base64(ciphertext.encode('utf-8')),
        "key": to_base64(key.encode('utf-8')),
        "meta": {}
    }

def monoalphabetic_decrypt(ciphertext_b64: str, key: str) -> str:
    try:
        ct_bytes = from_base64(ciphertext_b64)
        ciphertext = ct_bytes.decode('utf-8')
    except:
        raise ValueError("Invalid Base64 ciphertext")
        
    key = key.upper()
    if len(key) != 26:
        raise ValueError("Key must be 26 letters")
        
    # Inverse mapping
    inv_map_upper = {key[i]: chr(ord('A') + i) for i in range(26)}
    inv_map_lower = {key[i].lower(): chr(ord('a') + i) for i in range(26)}
    
    result = []
    for char in ciphertext:
        if char.isupper():
            result.append(inv_map_upper.get(char, char))
        elif char.islower():
            result.append(inv_map_lower.get(char, char))
        else:
            result.append(char)
    return "".join(result)

def vernam_encrypt(plaintext: str, key_input: str = None) -> dict:
    pt_bytes = plaintext.encode('utf-8')
    length = len(pt_bytes)
    
    if key_input:
        try:
            key_bytes = from_base64(key_input)
        except:
            key_bytes = key_input.encode('utf-8')
            
        if len(key_bytes) != length:
             raise ValueError(f"Key length ({len(key_bytes)}) must match plaintext byte length ({length})")
    else:
        key_bytes = random.randbytes(length)
        
    cipher_bytes = bytes(a ^ b for a, b in zip(pt_bytes, key_bytes))
    
    return {
        "ciphertext": to_base64(cipher_bytes),
        "key": to_base64(key_bytes),
        "meta": {}
    }

def vernam_decrypt(ciphertext_b64: str, key_input: str) -> str:
    ct_bytes = from_base64(ciphertext_b64)
    length = len(ct_bytes)
    
    try:
        key_bytes = from_base64(key_input)
    except:
        key_bytes = key_input.encode('utf-8')
        
    if len(key_bytes) != length:
        raise ValueError("Key length must match ciphertext length")
        
    pt_bytes = bytes(a ^ b for a, b in zip(ct_bytes, key_bytes))
    return pt_bytes.decode('utf-8')
