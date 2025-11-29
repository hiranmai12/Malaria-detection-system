🦟 Malaria Detection System (React + Flask + Deep Learning)

A full-stack Malaria Detection Web Application that uses a trained Deep Learning CNN model to classify cell images as Parasitized or Uninfected.
This project includes:

⚛️ React Frontend

🐍 Flask Backend (Python)

🧠 Deep Learning Model (.h5)

📤 Image Upload & Real-Time Prediction

🔐 User Authentication

📊 Interactive Dashboard

🧾 Test History Tracking

👤 Profile Settings

🌟 Features
🔐 Authentication System

Login / Signup using Flask backend

Saves session using LocalStorage

Profile Page & Settings Page

Update profile (name, email)

Change password

Delete account

🧪 Malaria Detection

Upload any cell image

Backend predicts:

Parasitized (%)

Uninfected (%)

Confidence Score

Animated bar graph

Test saved permanently to History

Auto-generated Test ID → TEST-00001

📊 Dashboard

Total Tests

Total Positive (Parasitized)

Total Negative (Uninfected)

Model Accuracy (94%)

Latest Detection Breakdown Graph

📁 Test History

All test records

Timestamp

File name

Result

Confidence

Test ID format: TEST-00001

👤 Account Settings

Update username

Update email

Change password

Delete account (backend supported)

🛠️ 1️⃣ Clone the Project
git clone https://github.com/hiranmai12/Malaria-detection-system.git
cd malaria-detection

🔧 2️⃣ Backend Setup (Flask + venv + Model)

📌 Step 1 — Create Virtual Environment
cd back
python -m venv venv


Activate it:

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

📌 Step 2 — Install Required Packages
pip install -r requirements.txt


If you don’t have requirements.txt yet, create one:

flask
flask-cors
flask_sqlalchemy
werkzeug
tensorflow
opencv-python
numpy


Install manually if needed:

pip install flask flask-cors flask_sqlalchemy werkzeug tensorflow opencv-python numpy

📌 Step 3 — Folder Structure for Backend

Inside back/ folder your structure should look like:

back/

│── app.py

│── venv/

│── instance/
│    └── malaria.db   (auto-created)

│── models/
│    └── malaria_model.h5   ← PUT YOUR MODEL HERE

│── uploads/        (auto-created for uploaded images)

❗ IMPORTANT: Put your .h5 model inside:
back/models/malaria_model.h5


The backend already loads it using:

MODEL_PATH = os.path.join(BASE_DIR, "models", "malaria_model.h5")

📌 Step 4 — Run Backend (creates malaria.db automatically)
python app.py


Flask server will run at:

http://127.0.0.1:5000


When you run it the first time → malaria.db is auto-created in /instance.

⚛️ 3️⃣ Frontend Setup (React)

Open a new terminal (do NOT close backend) and run:

cd back/frontend
npm install
npm start


Frontend runs at:

http://localhost:3000

📦 4️⃣ Final Folder Structure (Recommended for GitHub)
malaria-detection/

│── README.md

│── back/

│   │── app.py

│   │── requirements.txt

│   │── models/

│   │    └── malaria_model.h5   (NOT PUSHED TO GITHUB)

│   │── uploads/                (ignored)

│   │── instance/

│   │    └── malaria.db         (ignored)

│   │── venv/                   (ignored)

│   └── frontend/

│        │── package.json


│        │── public/

│        └── src/

│── training/

│   └── train_model.py

❌ 5️⃣ Files You Should NOT Push to GitHub

Add this to .gitignore:

venv/
.venv/
back/venv/
back/uploads/
back/instance/
back/models/
training/dataset/
node_modules/

🚀 6️⃣ Run the Full Project
Step 1 — Start Backend
cd back
venv\Scripts\activate   # Windows
python app.py

Step 2 — Start Frontend
cd back/frontend
npm start

