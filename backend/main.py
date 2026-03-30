"""
Точка входа приложения. Экспортирует app из app.py и запускает uvicorn.
"""

from app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
