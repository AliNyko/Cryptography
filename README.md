# Symmetric Cryptography Demo

A simple, local, database-free web application to demonstrate symmetric cryptography algorithms.

## Features

- **Classic Algorithms:** Caesar, Monoalphabetic, Vernam.
- **Modern Algorithms:** AES (EAX), 3DES (CBC), RC4.
- **Interface:** Clean, dark/light implementation (default light).
- **Backend:** Python + FastAPI.
- **Frontend:** HTML/CSS/Vanilla JS.

## Prerequisites

- Python 3.8+
- pip

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AliNyko/Cryptography.git
    cd Cryptography
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Usage

1.  **Run the application:**
    ```bash
    uvicorn main:app --reload
    ```

2.  **Open in browser:**
    Navigate to `http://127.0.0.1:8000`

## API Endpoints

- `GET /` : Main UI.
- `GET /api/algorithms` : List available algorithms.
- `POST /api/encrypt` : Encrypt plaintext.
  - Body: `{ "category": "classic|modern", "algorithm": "name", "plaintext": "text", "key": "optional" }`

## Notes

- **Educational Use Only:** The implementations of classic algorithms are for demonstration. Modern algorithms use `PyCryptodome` but this app is not intended for high-security production environments.
- **DES/RC4 Warning:** DES and RC4 are considered obsolete/insecure. They are included here for historical comparison.

## Project Structure

```
.
├── crypto/
│   ├── classic.py  # Classic algos
│   ├── modern.py   # PyCryptodome wrappers
│   └── utils.py    # Helpers
├── static/
│   ├── app.js      # Frontend logic
│   └── styles.css  # Styling
├── templates/
│   └── index.html  # Main page
├── main.py         # FastAPI app
├── requirements.txt
└── README.md
```
