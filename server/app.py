from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
)
from models import db, Task, User
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# -------------------- Config --------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # change this in production!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)  # access token expires
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)  # refresh token expires

# -------------------- Initialize --------------------
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()  # create tables if not exist

# -------------------- Auth Routes --------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email exists"}), 400

    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        # ✅ Convert user.id to string before passing to JWT
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
@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        current_user = int(get_jwt_identity())
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    tasks = Task.query.filter_by(user_id=current_user).all()
    return jsonify([t.to_dict() for t in tasks]), 200

@app.route("/tasks", methods=["POST"])
@jwt_required()
def add_task():
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
        completed=data.get("completed", False),  # ✅ accept if provided
        user_id=current_user
    )

    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    try:
        current_user = int(get_jwt_identity())
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    task = Task.query.filter_by(id=task_id, user_id=current_user).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

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

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    try:
        current_user = int(get_jwt_identity())
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    task = Task.query.filter_by(id=task_id, user_id=current_user).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

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

# -------------------- Run Server --------------------
if __name__ == "__main__":
    app.run(debug=True)
