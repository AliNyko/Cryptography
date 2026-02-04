from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional, Dict
from crypto import classic, modern

app = FastAPI(title="Symmetric Cryptography Demo")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class EncryptRequest(BaseModel):
    category: str
    algorithm: str
    plaintext: str
    key: Optional[str] = None
    options: Optional[Dict] = {}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/algorithms")
async def get_algorithms():
    return {
        "classic": ["Caesar", "Monoalphabetic", "Vernam"],
        "modern": ["AES", "3DES", "RC4"]
    }

@app.post("/api/encrypt")
async def encrypt_endpoint(data: EncryptRequest):
    try:
        if data.category == "classic":
            if data.algorithm == "Caesar":
                if not data.key:
                    raise ValueError("Shift value is required for Caesar")
                try:
                    shift = int(data.key)
                except ValueError:
                    raise ValueError("Shift must be an integer")
                return classic.caesar_encrypt(data.plaintext, shift)
            elif data.algorithm == "Monoalphabetic":
                if not data.key:
                    raise ValueError("Key is required for Monoalphabetic")
                return classic.monoalphabetic_encrypt(data.plaintext, data.key)
            elif data.algorithm == "Vernam":
                return classic.vernam_encrypt(data.plaintext, data.key)
            else:
                raise ValueError(f"Unknown classic algorithm: {data.algorithm}")
                
        elif data.category == "modern":
            if data.algorithm == "AES":
                return modern.aes_encrypt(data.plaintext, data.key)
            elif data.algorithm == "3DES":
                return modern.des3_encrypt(data.plaintext, data.key)
            elif data.algorithm == "RC4":
                return modern.rc4_encrypt(data.plaintext, data.key)
            else:
                raise ValueError(f"Unknown modern algorithm: {data.algorithm}")
        else:
            raise ValueError(f"Unknown category: {data.category}")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
