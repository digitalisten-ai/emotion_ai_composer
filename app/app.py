import sys
import os
import base64
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import streamlit as st
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
import scripts.inference as inference
#from scripts.train_model import run_training

# Tillgängliga känsloklasser
emotion_classes = [
    "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
]

# Aktiva klasser (maskad delmängd av 7-klassmodellen)
ACTIVE_CLASSES = ["happy", "sad", "fear"]  # ändra här om du vill testa andra
ACTIVE_SET = set(ACTIVE_CLASSES)

# Sidebar navigation
option = st.sidebar.selectbox("🧭 Navigera", ["Testa känsloigenkänning", "Träna ny modell", "Om appen"])

def predict_emotion_from_image(image):
    # Lazy-load modellen via inference (compile=False)
    try:
        model = inference.load_emotion_model()
    except Exception as e:
        st.error(f"Kunde inte ladda modellen: {e}")
        return "unknown"

    img = cv2.resize(np.array(image), (224, 224)).astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)

    # Prediktion över alla 7 klasser
    preds = model.predict(img)[0]

    # Hämta labels från inference och maska till aktiva klasser
    labels = getattr(inference, 'emotion_labels', [])
    if not labels or len(labels) != len(preds):
        st.error("Label-uppsättning matchar inte modellens utgångar.")
        return "unknown"

    import numpy as _np
    mask = _np.array([1.0 if lbl in ACTIVE_SET else 0.0 for lbl in labels], dtype=_np.float32)
    sub_probs = preds * mask
    total = float(sub_probs.sum())

    if total > 0.0:
        idx = int(_np.argmax(sub_probs))
        confidence = float(sub_probs[idx] / total)  # renormaliserad bland aktiva klasser
    else:
        # Fallback om masken skulle nolla allt (bör ej hända)
        idx = int(_np.argmax(preds))
        confidence = float(preds[idx])

    emotion = labels[idx]
    st.write(f"Sannolikhet (bland aktiva klasser): {confidence:.2f}")
    return emotion

def play_music(emotion):
    audio_file = f"assets/{emotion.lower()}.mp3"
    if os.path.exists(audio_file):
        with open(audio_file, "rb") as f:
            data = f.read()
            b64 = base64.b64encode(data).decode()
            md = f"""
            <audio autoplay>
                <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>
            """
            st.markdown(md, unsafe_allow_html=True)
    else:
        st.warning(f"Inget ljud hittades för: {emotion}")


if option == "Testa känsloigenkänning":
    st.title("🎵 Emotionell AI-kompositör")
    st.write("Ladda upp en bild av ett ansikte – AI:n tolkar känslan och spelar musik!")

    col1, col2 = st.columns([1, 1])
    with col1:
        uploaded_file = st.file_uploader("📷 Ladda upp en bild", type=["jpg", "jpeg", "png"])
        camera_img = st.camera_input("📸 Eller ta ett foto")

    image = None
    if uploaded_file:
        image = Image.open(uploaded_file)
    elif camera_img:
        image = Image.open(camera_img)

    with col2:
        if image:
            if image.mode != 'RGB':
                image = image.convert('RGB')
            st.image(image, caption="Din bild", use_column_width=True)

            emotion = predict_emotion_from_image(image)
            st.success(f"🧠 Identifierad känsla: {emotion}")
            play_music(emotion)

elif option == "Träna ny modell":
    st.title("🧠 Träna en ny känslomodell")
    st.markdown("Justera parametrar innan du påbörjar träning:")

    selected_classes = st.multiselect("✅ Välj klasser att inkludera:", emotion_classes, default=emotion_classes)
    epochs = st.slider("🧠 Antal Epochs", 1, 50, 10)
    learning_rate = st.number_input("📈 Learning Rate", value=0.0003, format="%.5f")
    normalize_cm = st.checkbox("Normalisera Confusion Matrix")

    if st.button("🚀 Starta träning"):
        if 'run_training' in globals():
            st.info("🧠 Träning påbörjad... detta kan ta några minuter ⏳")
            run_training(selected_classes=selected_classes, epochs=epochs, learning_rate=learning_rate)
            st.success("✅ Träningen är klar och modellen är sparad!")
        else:
            st.warning("Tränings-API är inte aktiverat i denna version. Lägg till 'run_training' i scripts.train_model för att använda detta.")

elif option == "Om appen":
    st.title("ℹ️ Om denna app")
    st.markdown("""
    Denna app använder AI för att analysera känslor i ansiktsbilder och matcha dem med passande musik.  
    - Modellen är tränad med hjälp av TensorFlow/Keras  
    - Musikfiler ligger i `assets/` och är kopplade till varje känsla  
    - Du kan ladda upp en bild eller använda kameran  
    - Modellträning kommer snart kunna styras via gränssnittet  
    """)
