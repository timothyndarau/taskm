import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from models import db, Task, User

# -------------------- App Config --------------------
app = Flask(
    __name__,
    static_folder="../frontend/build",   # 👈 Serve React build
    static_url_path="/"
)

CORS(app)

# Database (Render will inject DATABASE_URL env var for Postgres)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///task.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

# Init
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()


# -------------------- Profile Routes --------------------
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@app.route("/api/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]

    db.session.commit()
    return jsonify(user.to_dict()), 200


# -------------------- Auth Routes --------------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email exists"}), 400

    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.id
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401


# -------------------- Task Routes --------------------
@app.route("/api/tasks", methods=["GET", "POST"])
@jwt_required()
def tasks():
    if request.method == "GET":
        try:
            user_id = int(get_jwt_identity())
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user ID"}), 400

        tasks = Task.query.filter_by(user_id=user_id).all()
        return jsonify([t.to_dict() for t in tasks]), 200

    if request.method == "POST":
        try:
            current_user = int(get_jwt_identity())
        except ValueError:
            return jsonify({"error": "Invalid user ID"}), 400

        data = request.json
        title = data.get("title")
        if not title:
            return jsonify({"error": "Title is required"}), 400

        due_date = None
        if data.get("due_date"):
            try:
                due_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid due_date format. Use YYYY-MM-DD"}), 400

        new_task = Task(
            title=title,
            due_date=due_date,
            priority=data.get("priority", "Medium"),
            completed=data.get("completed", False),
            user_id=current_user
        )

        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT", "DELETE"])
@jwt_required()
def task_detail(task_id):
    try:
        current_user = int(get_jwt_identity())
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    task = Task.query.filter_by(id=task_id, user_id=current_user).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    if request.method == "PUT":
        data = request.json
        task.title = data.get("title", task.title)
        task.completed = data.get("completed", task.completed)

        if data.get("due_date"):
            try:
                task.due_date = datetime.strptime(data["due_date"], "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid due_date format. Use YYYY-MM-DD"}), 400

        task.priority = data.get("priority", task.priority)
        db.session.commit()
        return jsonify(task.to_dict()), 200

    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200


# -------------------- Refresh Token --------------------
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200


# -------------------- Serve React Frontend --------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    """Serve React build for any non-API route."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


# -------------------- Run Server --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
