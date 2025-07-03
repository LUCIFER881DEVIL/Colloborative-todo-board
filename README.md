# 🧠 Collaborative Real-Time To-Do Board

A full-stack Trello-style Kanban board where multiple users can **register**, **log in**, **manage tasks**, and **collaborate in real-time** using drag-and-drop. Powered by **React**, **Node.js/Express**, **MongoDB**, **WebSockets**, and **JWT Authentication**.

---

## 🚀 Live Demo

🔗 [Frontend Deployed on Vercel](https://your-frontend.vercel.app)  
🔗 [Backend Deployed on Render](https://your-backend.onrender.com)  
🔗 [📹 Demo Video (YouTube/Drive)](https://your-demo-link.com)

---

## 📦 Tech Stack

### 🔐 Backend
- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **Socket.IO** for real-time sync
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS**, **dotenv**, **helmet**, etc.

### 🎨 Frontend
- **React (Vite)**
- **Plain CSS (Responsive + Animations)**
- **React Router DOM**
- **Axios** for API communication
- **Drag & Drop** via native HTML5 API

---

## 📁 Folder Structure

collab-todo-board/
├── backend/ # Node.js + Express + MongoDB
│ ├── routes/
│ ├── models/
│ └── controllers/
├── collab-todo-client/ # React + CSS frontend
│ ├── components/
│ ├── pages/
│ └── styles/

yaml
Copy
Edit

---

## 🔧 Installation & Running Locally

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/collab-todo-board.git
cd collab-todo-board
2️⃣ Backend Setup
bash
Copy
Edit
cd backend
npm install
Create a .env file with:

ini
Copy
Edit
PORT=5000
MONGO_URI=mongodb+srv://<your-db-url>
JWT_SECRET=yourSecretKey
Start the server:

bash
Copy
Edit
npm run dev
3️⃣ Frontend Setup
bash
Copy
Edit
cd collab-todo-client
npm install
Start the client:

bash
Copy
Edit
npm run dev
Visit: http://localhost:5173

🔐 Features
✅ User Registration & Login
✅ JWT-based Auth
✅ Kanban Columns (Todo, In Progress, Done)
✅ Drag-and-Drop Tasks
✅ Real-Time Sync using WebSockets
✅ Smart Assign (AI-style least-busy user assignment)
✅ Conflict Detection + Resolution
✅ Action Logs (last 20 actions with timestamp)
✅ Responsive Design
✅ Clean UI + CSS Animations

🧠 Smart Assign Logic
When Smart Assign is clicked for a task:

We calculate the number of active tasks (not Done) per user.

The task is auto-assigned to the user with the fewest active tasks.

If multiple users have same minimum, the first one is selected.

This prevents overburdening users and keeps load distributed.

⚔️ Conflict Handling
If two users edit the same task at the same time:

A conflict modal appears when changes differ.

Users see:

Their version (local)

Server version (remote)

They can choose to:

🔀 Merge: Combine both changes

⚡ Overwrite: Force save local version

❌ Cancel: Abort update

Each resolution is logged in the activity panel.

📜 Activity Log
Shows last 20 actions

Includes:

Task created, moved, deleted

Smart assigned

Conflict resolved

Includes user name & timestamp

Updates live