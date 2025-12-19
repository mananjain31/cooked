# 🍳 Cooked

**Cooked** is a fun web app that lets users log in with their Spotify account and get their music taste **roasted** using AI.

The app analyzes:
- Top tracks
- Playlists
- Recently played songs
- Saved tracks (library)
- Basic profile info

…and then delivers a savage-but-playful roast.

---

## 🧠 Tech Stack

### Frontend
- React (Vite + TypeScript)
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- Axios
- Spotify Web API (Authorization Code Flow)
- Google Gemini API (free tier)

---

## 🔐 Authentication Flow

1. User clicks **Login with Spotify**
2. Backend redirects to Spotify OAuth
3. Spotify redirects back with an authorization `code`
4. Backend exchanges `code` for an access token
5. Backend fetches user Spotify data
6. Gemini generates a roast based on the data

> Spotify secrets are stored **only on the backend**.

---

## 🚀 Getting Started (Local)

### 1. Clone the repo
```bash
git clone <repo-url>
cd cooked
```

---

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/auth/callback
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Run backend:
```bash
node index.js
```

---

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

## 🔥 Roast Endpoint

```
GET /api/roast
```

Response:
```json
{
  "roast": "Your Spotify taste feels like it was curated by a sad algorithm at 3 AM..."
}
```

---

## ⚠️ Notes

- This project is currently designed for **local development**
- Tokens are stored in memory (no database yet)
- Gemini free tier limits apply
- No hate speech or personal attacks — roasts are music-based only

---

## 🛣️ Roadmap

- Roast intensity levels (Mild / Medium / Nuclear)
- Roast history
- Shareable roast cards
- Offline roast fallback
- Multi-user support with database

---

## 📜 License

MIT — use freely, but don’t blame the app if it hurts your feelings.
