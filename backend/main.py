from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sys
import uvicorn

# --- Path setup ---
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, os.pardir))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# --- Robust import for inference ---
try:
    # If backend is a package (uvicorn backend.main:app)
    from . import inference  # type: ignore
except Exception:
    try:
        # Absolute package import
        import backend.inference as inference  # type: ignore
    except Exception:
        try:
            # Running directly inside backend dir (uvicorn main:app)
            import inference  # type: ignore
        except Exception:
            # Fall back to project-level scripts package
            from scripts import inference  # type: ignore

# --- CORS ---
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://192.168.1.184:8080",
    # Lägg till dina prod-URLs här (t.ex. GitHub Pages + Render)
    # "https://digitalisten-ai.github.io",
    # "https://digitalisten-ai.github.io/<repo>",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static assets (mp3) ---
asset_candidates = [
    os.path.join(BACKEND_DIR, "assets"),
    os.path.join(PROJECT_ROOT, "assets"),
]
for p in asset_candidates:
    if os.path.isdir(p):
        app.mount("/assets", StaticFiles(directory=p), name="assets")
        break


class PredictOut(BaseModel):
    emotion: str
    confidence: float
    audio: str


@app.get("/api/health")
def health():
    try:
        loader = getattr(inference, "_get_model", None) or getattr(inference, "load_emotion_model", None)
        if loader is None:
            raise RuntimeError("No model loader found in inference module")
        _ = loader()  # trigger model load
        # Optional: return which MODEL_PATH was used if available
        model_path = getattr(inference, "MODEL_PATH", None)
        return {"status": "ok", "model_path": model_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model load failed: {e}")


@app.post("/api/predict", response_model=PredictOut)
async def predict(image: UploadFile = File(...)):
    try:
        data = await image.read()
        out = inference.predict_from_bytes(data)

        if not isinstance(out, tuple):
            raise ValueError("predict_from_bytes returned a non-tuple result")

        if len(out) == 3:
            emotion, conf, audio = out
        elif len(out) == 2:
            emotion, conf = out
            audio = f"/assets/{emotion}.mp3"
        else:
            raise ValueError(f"Unexpected return length from predict_from_bytes: {len(out)}")

        return PredictOut(emotion=str(emotion), confidence=float(conf), audio=str(audio))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ogiltig bild: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)