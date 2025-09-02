import streamlit as st
import glob
from grad_cam import display_gradcam

st.title("Grad-CAM Visualization")

test_image_paths = glob.glob("data/test/*/*.jpg")
if not test_image_paths:
    st.warning("No test images found in data/test/")
else:
    image_choice = st.selectbox("Select a test image", test_image_paths)
    from PIL import Image
    st.image(Image.open(image_choice), caption="Selected Image", use_column_width=True)
    if st.button("Generate Grad-CAM"):
        display_gradcam(image_choice)
        st.success("Grad-CAM image generated.")
        st.image("presentation/gradcam_output.png", caption="Grad-CAM Output", use_column_width=True)
