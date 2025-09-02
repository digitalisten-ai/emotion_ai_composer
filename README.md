# Emotion AI Composer 🎵🤖

An AI-powered application that detects emotions from facial images and plays matching music.  
Built with **TensorFlow/Keras** for deep learning, **FastAPI** for backend, and **React (Vite + TypeScript)** for frontend.  
This project demonstrates how emotion recognition can enhance **user experience** in entertainment, edtech, and UX design.

---

## ✨ Features
- Upload or capture a face photo via webcam
- Real-time emotion classification (Happy, Sad, Angry, etc.)
- Auto-play emotion-specific background music
- Interactive web UI (React + Shadcn UI)
- Backend API built with FastAPI
- Deployable on **Render** (backend) and **GitHub Pages** (frontend)

---

## 🛠 Tech Stack
- **Backend:** Python, FastAPI, TensorFlow/Keras, OpenCV, Pillow
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Deployment:** Render (backend), GitHub Pages (frontend)

---

## 📂 Project Structure
```
emotion_ai_composer/
│
├── backend/              # FastAPI backend
│   ├── main.py           # API entrypoint
│   ├── inference.py      # Model loading & prediction
│   ├── models/           # Trained models (.keras)
│   ├── assets/           # Music files (happy.mp3, sad.mp3, etc.)
│   └── requirements.txt
│
├── frontend/             # React + Vite frontend
│   ├── src/              # Components & pages
│   ├── public/           # Static files
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### 1. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs at: [http://127.0.0.1:8000](http://127.0.0.1:8000)  
Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

### Backend (Render)
1. Push project to GitHub
2. Create a new **Web Service** in Render
3. Set **Root Directory** = `backend`
4. Start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```
5. Add environment variables if needed

### Frontend (GitHub Pages)
```bash
cd frontend
npm run deploy
```
This publishes the frontend to GitHub Pages.

---

## 🤝 Contributing
Contributions are welcome!  
- Fork the repo
- Create a new feature branch
- Submit a PR

---

## 📄 License
MIT License (add your license file here)

---
