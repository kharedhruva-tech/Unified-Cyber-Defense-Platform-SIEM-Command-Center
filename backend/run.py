import os
import uvicorn

if __name__ == "__main__":
    os.environ["PYTHONUNBUFFERED"] = "1"
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, log_level="info", access_log=True)
