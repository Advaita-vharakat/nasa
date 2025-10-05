from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, PlainTextResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from backend.fast_summarizer import summarize_pdf
import httpx  # async requests

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

NODE_URL = "http://localhost:3004"

# --- Node.js route proxies ---

@app.get("/chat/get")
async def chat_get():
    return RedirectResponse(url=f"{NODE_URL}/chat/get")

@app.get("/draft")
async def draft():
    return RedirectResponse(url=f"{NODE_URL}/draft")

@app.get("/storyline")
async def storyline():
    return RedirectResponse(url=f"{NODE_URL}/storyline")

@app.get("/graph")
async def storyline():
    return RedirectResponse(url=f"{NODE_URL}/graph")

@app.get("/home")
async def home_proxy():
    return RedirectResponse(url=f"{NODE_URL}/home")

# --- PDF Summarizer routes ---

@app.get("/", response_class=HTMLResponse)
async def index():
    # Serve your local index.html for the PDF summarizer
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/summarize", response_class=PlainTextResponse)
async def summarize(file: UploadFile = File(...), mode: str = Form("long")):
    pdf_bytes = await file.read()
    summary = summarize_pdf(pdf_bytes, verbosity=mode)
    return summary
