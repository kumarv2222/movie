# Netflox - Movie Streaming Platform API 🎬

A full-stack movie streaming application inspired by Netflix, built with React, Node.js, and Express. It features user authentication, a beautiful movie dashboard with TMDB integration, and an admin view for database management.

## 🚀 Live Demo
- **Frontend (Static):** [http://movie-netflox-v1.surge.sh](http://movie-netflox-v1.surge.sh)
- **Deployment Ready:** Vercel (Configured with `vercel.json`)

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, React Router 7, Axios
- **Backend:** Node.js, Express, JWT, Bcrypt
- **Database:** Aiven PostgreSQL (Primary) / SQLite (Local Fallback)
- **API:** The Movie Database (TMDB)

## ✨ Features
- **User Authentication:** Secure Sign Up and Sign In using JWT and Bcrypt hashing.
- **Dynamic Dashboard:** Real-time movie data fetched from TMDB.
- **Protected Routes:** Only registered users can access the movie list.
- **Admin Panel:** A dedicated view for admins to monitor registered users.
- **Self-Healing Database:** Automatically falls back to local SQLite if the cloud database is reachable.
- **Responsive Design:** Premium UI with glassmorphism and Netflix-inspired aesthetics.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- TMDB API Key (Configured in `App.jsx`)

### 2. Installation
```bash
# Install dependencies
npm install

# Install server dependencies
cd server
npm install
```

### 3. Running Locally
```bash
# Start the Backend (from /server)
npm run dev

# Start the Frontend (from root)
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🌐 Deployment

### Deploy to Vercel (Recommended)
This project is pre-configured for Vercel serverless deployment. Simply import your GitHub repo and add these **Environment Variables**:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgres://avnadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require` |
| `JWT_SECRET` | `your_secret_key` |
| `VITE_TMDB_KEY` | `your_tmdb_api_key` |

```bash
npx vercel --prod
```

### Deploy to Surge (Frontend Only)
```bash
npm run build
npx surge dist your-domain.surge.sh
```

## 📄 License
ISC
