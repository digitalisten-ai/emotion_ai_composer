import os
import io
from typing import Tuple
import numpy as np
from PIL import Image
import tensorflow as tf
import keras

try:
    import cv2
    _HAS_CV2 = True
except Exception:
    cv2 = None  # type: ignore
    _HAS_CV2 = False

USE_FACE_DETECTION = True  # Toggle face-cropping on/off

# --- Custom LR schedule (registered) ---
try:
    CosineDecayWithWarmup  # type: ignore  # noqa
except NameError:
    from keras.optimizers.schedules import LearningRateSchedule

    @keras.saving.register_keras_serializable()
    class CosineDecayWithWarmup(LearningRateSchedule):
        def __init__(self, base_lr, total_steps, warmup_steps, min_lr):
            super().__init__()
            self.base_lr = float(base_lr)
            self.total_steps = int(total_steps)
            self.warmup_steps = int(warmup_steps)
            self.min_lr = float(min_lr)

        def __call__(self, step):
            import numpy as _np
            step = tf.cast(step, tf.float32)
            warmup_steps_f = tf.cast(self.warmup_steps, tf.float32)
            total_span = tf.cast(tf.maximum(1, self.total_steps - self.warmup_steps), tf.float32)
            warmup_lr = self.base_lr * (step / tf.maximum(1.0, warmup_steps_f))
            progress = (step - warmup_steps_f) / total_span
            cosine_decay = 0.5 * (1.0 + tf.math.cos(tf.constant(_np.pi, dtype=tf.float32) * progress))
            decayed = (self.base_lr - self.min_lr) * cosine_decay + self.min_lr
            return tf.where(step < warmup_steps_f, warmup_lr, decayed)

        def get_config(self):
            return {
                "base_lr": self.base_lr,
                "total_steps": self.total_steps,
                "warmup_steps": self.warmup_steps,
                "min_lr": self.min_lr,
            }

# --- Model cache & labels ---
_MODEL = None
_CUSTOM_OBJECTS = {"CosineDecayWithWarmup": CosineDecayWithWarmup}
LABELS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
ACTIVE_SET = {"happy", "sad", "fear"}  # mask to these classes

# --- Model path resolution (backend/scripts aware) ---
SCRIPT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, os.pardir))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, os.pardir))

_ENV_MODEL_PATH = os.environ.get("MODEL_PATH")
_MODEL_CANDIDATES = [
    os.path.join(BACKEND_DIR, "models", "emotion_model_2.0.keras"),      # backend/models
    os.path.join(PROJECT_ROOT, "models", "emotion_model_2.0.keras"),      # repo root/models
]

def _resolve_model_path() -> str:
    if _ENV_MODEL_PATH and os.path.isfile(_ENV_MODEL_PATH):
        return _ENV_MODEL_PATH
    for p in _MODEL_CANDIDATES:
        if os.path.isfile(p):
            return p
    # Prefer env path in error if set, else first candidate
    return _ENV_MODEL_PATH or _MODEL_CANDIDATES[0]

MODEL_PATH = _resolve_model_path()

# Class-wise calibration to mitigate "happy" bias (tune from validation set)
CLASS_WEIGHTS = {
    "happy": 0.85,
    "sad": 1.15,
    "fear": 1.35,
}
TOP2_MARGIN = 0.08  # if top-2 are within this margin and top-1 is happy, prefer top-2 if in ACTIVE_SET
EPS = 1e-9


def _square_center_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    if w == h:
        return img
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def _detect_face_crop(img_rgb: Image.Image) -> Image.Image:
    """Crop to largest face; fallback to center square crop if no face detected."""
    if not _HAS_CV2 or not USE_FACE_DETECTION:
        return _square_center_crop(img_rgb)
    try:
        # Convert PIL RGB -> OpenCV BGR
        np_img = np.array(img_rgb)[:, :, ::-1]
        gray = cv2.cvtColor(np_img, cv2.COLOR_BGR2GRAY)
        # Use default haarcascade from cv2 package
        cascade_path = os.path.join(os.path.dirname(cv2.__file__), "data", "haarcascade_frontalface_default.xml")
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        if len(faces) == 0:
            return _square_center_crop(img_rgb)
        # Pick largest face by area
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        # Add a small margin
        margin = int(0.15 * max(w, h))
        x0 = max(0, x - margin)
        y0 = max(0, y - margin)
        x1 = min(np_img.shape[1], x + w + margin)
        y1 = min(np_img.shape[0], y + h + margin)
        face_bgr = np_img[y0:y1, x0:x1]
        # Back to PIL RGB
        face_rgb = Image.fromarray(face_bgr[:, :, ::-1])
        return _square_center_crop(face_rgb)
    except Exception:
        # Any failure: fall back to safe center crop
        return _square_center_crop(img_rgb)


def _prepare_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Smart crop around face or center square
    img = _detect_face_crop(img)
    # Resize to model input
    img = img.resize((224, 224), Image.BILINEAR)
    # Optional gentle contrast normalization using OpenCV CLAHE on the luminance channel
    if _HAS_CV2:
        np_rgb = np.asarray(img).astype("uint8")
        lab = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l2 = clahe.apply(l)
        lab2 = cv2.merge([l2, a, b])
        np_rgb = cv2.cvtColor(lab2, cv2.COLOR_Lab2RGB)
        img = Image.fromarray(np_rgb)
    # Final to float32 [0,1]
    arr = np.asarray(img).astype("float32") / 255.0
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


def _get_model():
    global _MODEL
    if _MODEL is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}. Place the model at 'backend/models/emotion_model_2.0.keras' or set MODEL_PATH env."
            )
        _MODEL = tf.keras.models.load_model(MODEL_PATH, custom_objects=_CUSTOM_OBJECTS)
    return _MODEL


def predict_from_bytes(image_bytes: bytes) -> Tuple[str, float, str]:
    """Predict emotion from raw image bytes. Returns (label, confidence, audio_path)."""
    model = _get_model()
    inp = _prepare_image_from_bytes(image_bytes)
    preds = model.predict(inp, verbose=0)[0]  # shape (7,)

    # Apply class-wise calibration (probability domain) then renormalize
    calibrated = preds.copy().astype("float32")
    for i, lbl in enumerate(LABELS):
        w = CLASS_WEIGHTS.get(lbl)
        if w is not None:
            calibrated[i] = calibrated[i] * float(w)
    calibrated_sum = float(calibrated.sum())
    if calibrated_sum > 0:
        calibrated = calibrated / calibrated_sum
    else:
        calibrated = preds  # fallback

    # Mask to active classes and renormalize
    mask = np.array([1.0 if lbl in ACTIVE_SET else 0.0 for lbl in LABELS], dtype=np.float32)
    sub = calibrated * mask
    total = float(sub.sum())

    if total > 0.0:
        idx = int(np.argmax(sub))
        conf = float(sub[idx] / max(total, EPS))
    else:
        idx = int(np.argmax(calibrated))
        conf = float(calibrated[idx])

    label = LABELS[idx]
    audio_path = os.path.join("/assets", f"{label}.mp3")

    # Top-2 tie-break: if top-1 is happy but top-2 is very close and in ACTIVE_SET, prefer top-2
    if label == "happy":
        # compute top-2 on the masked & calibrated distribution
        if total > 0.0:
            masked_probs = sub / max(total, EPS)
        else:
            masked_probs = calibrated  # unlikely path
        top2_idx = int(np.argsort(masked_probs)[-2])  # second best index
        top2_lbl = LABELS[top2_idx]
        top2_prob = float(masked_probs[top2_idx])
        top1_prob = float(masked_probs[idx])
        if top2_lbl in ACTIVE_SET and (top1_prob - top2_prob) <= TOP2_MARGIN and top2_lbl != "happy":
            label = top2_lbl
            audio_path = os.path.join("/assets", f"{label}.mp3")
            conf = top2_prob

    # Low-confidence guard: if masked confidence is very low, keep original top without mask (useful when active set excludes the true class)
    if conf < 0.35:  # tune threshold as needed
        idx_full = int(np.argmax(preds))
        label_full = LABELS[idx_full]
        if label_full in ACTIVE_SET:
            label = label_full
            audio_path = os.path.join("/assets", f"{label}.mp3")
            conf = float(preds[idx_full])

    return label, conf, audio_path
