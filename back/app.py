from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import numpy as np
import cv2
import os
from datetime import datetime

# ---------------- APP & CONFIG ---------------- #
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Upload folder
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# SQLite DB
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///malaria.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------- MODELS ---------------- #
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashed password
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Upload(db.Model):
    __tablename__ = "uploads"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # can be null if not logged in
    filename = db.Column(db.String(200), nullable=False)
    result_label = db.Column(db.String(50), nullable=False)  # "Parasitized" / "Uninfected"
    parasitized = db.Column(db.Float, nullable=False)        # percentage
    uninfected = db.Column(db.Float, nullable=False)         # percentage
    confidence = db.Column(db.Float, nullable=False)         # 0–1
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------- ML MODEL ---------------- #
from tensorflow.keras.models import load_model

MODEL_PATH = os.path.join(BASE_DIR, "models", "malaria_model.h5")
model = load_model(MODEL_PATH)


def preprocess_image(filepath):
    img = cv2.imread(filepath)
    if img is None:
        raise ValueError(f"Could not read image: {filepath}")

    img = cv2.resize(img, (50, 50))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype("float32") / 255.0
    # shape: (1, 50, 50, 3)
    img = np.expand_dims(img, axis=0)
    return img


def predict_malaria(filepath):
    """
    Returns:
        {
            "parasitized": float (0–100),
            "uninfected": float (0–100),
            "confidence": float (0–1),
            "is_positive": bool,
            "label": "Parasitized" | "Uninfected"
        }
    """
    img = preprocess_image(filepath)
    prediction = model.predict(img, verbose=0)[0]

    # Handle binary or 2-class outputs
    if len(prediction) == 1:
        pos_prob = float(prediction[0])
    else:
        # assume index 1 is "Parasitized"
        pos_prob = float(prediction[1])

    pos_clamped = max(0.0, min(1.0, pos_prob))
    neg_clamped = 1.0 - pos_clamped

    parasitized_pct = round(pos_clamped * 100, 1)
    uninfected_pct = round(neg_clamped * 100, 1)
    confidence = max(pos_clamped, neg_clamped)

    is_positive = parasitized_pct > uninfected_pct
    label = "Parasitized" if is_positive else "Uninfected"

    return {
        "parasitized": parasitized_pct,
        "uninfected": uninfected_pct,
        "confidence": confidence,
        "is_positive": is_positive,
        "label": label,
    }


# ---------------- AUTH ROUTES ---------------- #
# These correspond to your /login and /signup React pages.

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=name, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    # simple mock token (your frontend just stores this)
    token = f"mock-jwt-{user.id}"

    return jsonify({
        "message": "Signup successful",
        "token": token,
        "user": {
            "user_id": user.id,
            "name": user.username,
            "email": user.email
        }
    }), 200


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = f"mock-jwt-{user.id}"

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "user_id": user.id,
            "name": user.username,
            "email": user.email
        }
    }), 200


# ---------------- PROFILE / SETTINGS ---------------- #
# /profile  & /profile/settings (React) will use these APIs.

@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "user_id": user.id,
        "name": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    })


@app.route("/user/<int:user_id>", methods=["PUT", "PATCH"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    new_name = data.get("name")
    new_email = data.get("email")
    new_password = data.get("password")

    if new_name:
        user.username = new_name
    if new_email:
        # optional: check for conflicts
        if User.query.filter(User.email == new_email, User.id != user_id).first():
            return jsonify({"message": "Email already in use"}), 400
        user.email = new_email
    if new_password:
        user.password = generate_password_hash(new_password)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200


# ---------------- CHANGE PASSWORD ---------------- #
@app.route("/user/<int:user_id>/password", methods=["POST"])
def change_password(user_id):
    """
    Change the user's password.
    Expects JSON: { "oldPassword": "...", "newPassword": "..." }
    """
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"message": "Both oldPassword and newPassword are required."}), 400

    # Check old password
    if not check_password_hash(user.password, old_password):
        return jsonify({"message": "Old password is incorrect."}), 400

    if len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters."}), 400

    # Update password
    user.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully."}), 200


# ---------------- DELETE ACCOUNT ---------------- #
@app.route("/user/<int:user_id>", methods=["DELETE"])
def delete_account(user_id):
    """
    Permanently delete a user and all their uploads.
    WARNING: This cannot be undone.
    """
    user = User.query.get_or_404(user_id)

    # Delete all uploads for this user
    Upload.query.filter_by(user_id=user_id).delete()

    # Delete the user
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account and all related data deleted successfully."}), 200


# ---------------- UPLOAD & RESULT (Dashboard + ResultPage) ---------------- #
# React: Dashboard calls POST http://localhost:5000/upload with FormData("image", file)

@app.route("/upload", methods=["POST"])
def upload_file():
    if "image" not in request.files:
        return jsonify({"message": "No image file uploaded"}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    # Optional user_id from formData (if you send it)
    user_id = request.form.get("user_id")
    try:
        user_id = int(user_id) if user_id is not None else None
    except ValueError:
        user_id = None

    # Save the file
    safe_name = image_file.filename
    save_name = f"{user_id}_{safe_name}" if user_id is not None else safe_name
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], save_name)
    image_file.save(filepath)

    # Run prediction
    try:
        pred = predict_malaria(filepath)
    except Exception as e:
        return jsonify({"message": f"Error during prediction: {str(e)}"}), 500

    # Save to DB
    upload = Upload(
        user_id=user_id,
        filename=safe_name,
        result_label=pred["label"],
        parasitized=pred["parasitized"],
        uninfected=pred["uninfected"],
        confidence=pred["confidence"],
    )
    db.session.add(upload)
    db.session.commit()  # <-- ID is assigned here

    # Create formatted test ID like TEST-00001
    test_code = f"TEST-{upload.id:05d}"

    # Model's fixed accuracy (matches your dashboard's 94%)
    MODEL_ACCURACY = 94.0

    return jsonify({
        "message": "File uploaded and prediction done",
        "filename": safe_name,
        "user_id": user_id,
        "is_positive": pred["is_positive"],
        "parasitized": pred["parasitized"],
        "uninfected": pred["uninfected"],
        "confidence": pred["confidence"],
        "accuracy": MODEL_ACCURACY,
        "upload_id": upload.id,
        "test_code": test_code
    }), 200


# ---------------- HISTORY & STATS (for /history, /result, /dashboard) ---------------- #

@app.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    """
    Used by History page (/history) to show all past uploads for this user.
    """
    uploads = (
        Upload.query
        .filter_by(user_id=user_id)
        .order_by(Upload.created_at.desc())
        .all()
    )

    out = []
    for u in uploads:
        test_code = f"TEST-{u.id:05d}"  # formatted test ID
        out.append({
            "upload_id": u.id,
            "test_code": test_code,
            "filename": u.filename,
            "result_label": u.result_label,
            "parasitized": u.parasitized,
            "uninfected": u.uninfected,
            "confidence": u.confidence,
            "created_at": u.created_at.isoformat()
        })
    return jsonify(out), 200


@app.route("/stats/<int:user_id>", methods=["GET"])
def get_stats(user_id):
    """
    Helper for Dashboard / ResultPage: backend stats instead of localStorage.
    """
    uploads = Upload.query.filter_by(user_id=user_id).all()
    total_tests = len(uploads)
    positive_tests = sum(1 for u in uploads if u.result_label == "Parasitized")
    negative_tests = total_tests - positive_tests
    MODEL_ACCURACY = 94.0

    return jsonify({
        "totalTests": total_tests,
        "positiveTests": positive_tests,
        "negativeTests": negative_tests,
        "accuracy": MODEL_ACCURACY
    }), 200


# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    with app.app_context():
        db.create_all()   # creates malaria.db with users + uploads tables
    app.run(debug=True, host="127.0.0.1", port=5000)
