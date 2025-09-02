import tensorflow as tf
import cv2
import numpy as np
import os
from functools import lru_cache

emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
# Aktiva klasser (maskad delmängd av 7-klassmodellen)
ACTIVE_CLASSES = ["happy", "sad", "fear"]
ACTIVE_SET = set(ACTIVE_CLASSES)
__all__ = ['emotion_labels', 'load_emotion_model']

@lru_cache(maxsize=1)
def load_emotion_model():
    """Load and cache the emotion model once for inference."""
    return tf.keras.models.load_model('models/emotion_model_2.0.keras', compile=False)

def predict_emotion(image_path):
    try:
        model = load_emotion_model()
        # Läs in och förbered bilden
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Kan inte läsa bilden: {image_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=0)  # (1, 224, 224, 3)

        # Prediktion
        preds = model.predict(img)[0]  # (7,)

        # Maska till aktiva klasser och renormalisera
        mask = np.array([1.0 if lbl in ACTIVE_SET else 0.0 for lbl in emotion_labels], dtype=np.float32)
        sub_probs = preds * mask
        total = float(sub_probs.sum())

        if total > 0.0:
            idx = int(np.argmax(sub_probs))
            confidence = float(sub_probs[idx] / total)
        else:
            idx = int(np.argmax(preds))
            confidence = float(preds[idx])

        emotion = emotion_labels[idx]
        mp3_path = os.path.join('assets', f"{emotion}.mp3")
        return emotion, mp3_path

    except Exception as e:
        return f"Fel vid prediktion: {e}", None
