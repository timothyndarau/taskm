# 📌 DidgiTasks  

A fullstack **task management app** built with **React (frontend)** and **Flask (backend)**.  
Supports **user signup/login with JWT**, profile editing, and CRUD operations on tasks.  

---

## 🚀 Features  

- 🔑 **User Authentication** (JWT-based)  
- 📝 **Task Management** (create, update, delete, mark complete)  
- 🏠 **Home Dashboard** (shows live task count)  
- 👤 **Profile Page** (edit username & email)  
- 🎨 **Themes** (light / dark / colorful)  
- ⚡ **RESTful API** with Flask + SQLAlchemy  

---

## 📂 Project Structure  


---

## 🛠️ Local Installation  

### 1️⃣ Backend (Flask)  

```bash
cd backend
python -m venv venv
source venv/bin/activate   # on mac/linux
venv\Scripts\activate      # on windows

pip install -r requirements.txt
flask db upgrade
flask run


cd frontend
npm install
npm start
