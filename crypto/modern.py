from Crypto.Cipher import AES, DES3, ARC4
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
from .utils import to_base64, from_base64

def aes_encrypt(plaintext: str, key_b64: str = None) -> dict:
    if key_b64:
        key = from_base64(key_b64)
        if len(key) not in (16, 32):
             raise ValueError("AES key must be 16 or 32 bytes")
    else:
        key = get_random_bytes(16)
        
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode('utf-8'))
    
    return {
        "ciphertext": to_base64(ciphertext),
        "key": to_base64(key),
        "meta": {
            "nonce": to_base64(cipher.nonce),
            "tag": to_base64(tag)
        }
    }

def aes_decrypt(ciphertext_b64: str, key_b64: str, nonce_b64: str, tag_b64: str) -> str:
    key = from_base64(key_b64)
    nonce = from_base64(nonce_b64)
    tag = from_base64(tag_b64)
    ciphertext = from_base64(ciphertext_b64)
    
    cipher = AES.new(key, AES.MODE_EAX, nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode('utf-8')

def des3_encrypt(plaintext: str, key_b64: str = None) -> dict:
    if key_b64:
        key = from_base64(key_b64)
        if len(key) not in (16, 24):
             raise ValueError("3DES key must be 16 or 24 bytes")
    else:
        # Generate 24 bytes and adjust parity for DES3
        raw_key = get_random_bytes(24)
        key = DES3.adjust_key_parity(raw_key)
        
    iv = get_random_bytes(8)
    cipher = DES3.new(key, DES3.MODE_CBC, iv)
    padded_text = pad(plaintext.encode('utf-8'), DES3.block_size)
    ciphertext = cipher.encrypt(padded_text)
    
    return {
        "ciphertext": to_base64(ciphertext),
        "key": to_base64(key),
        "meta": {
            "iv": to_base64(iv)
        }
    }

def des3_decrypt(ciphertext_b64: str, key_b64: str, iv_b64: str) -> str:
    key = from_base64(key_b64)
    iv = from_base64(iv_b64)
    ciphertext = from_base64(ciphertext_b64)
    
    cipher = DES3.new(key, DES3.MODE_CBC, iv)
    padded_text = cipher.decrypt(ciphertext)
    plaintext = unpad(padded_text, DES3.block_size)
    return plaintext.decode('utf-8')

def rc4_encrypt(plaintext: str, key_b64: str = None) -> dict:
    if key_b64:
        key = from_base64(key_b64)
        if len(key) < 5:
             raise ValueError("RC4 key must be at least 5 bytes")
    else:
        key = get_random_bytes(16)
        
    cipher = ARC4.new(key)
    ciphertext = cipher.encrypt(plaintext.encode('utf-8'))
    
    return {
        "ciphertext": to_base64(ciphertext),
        "key": to_base64(key),
        "meta": {}
    }

def rc4_decrypt(ciphertext_b64: str, key_b64: str) -> str:
    key = from_base64(key_b64)
    ciphertext = from_base64(ciphertext_b64)
    
    cipher = ARC4.new(key)
    plaintext = cipher.decrypt(ciphertext)
    return plaintext.decode('utf-8')
