# Loyal Listener 🎵

**When you can't seem to get enough of your favorite artists**

Loyal Listener is a web application that allows users to instantly create comprehensive Spotify playlists containing every song from their favorite artists. Simply search for an artist and generate a playlist with their complete discography.

## 🌟 Features

- **Spotify OAuth Integration** - Secure login with your Spotify account
- **Artist Search** - Search for any artist using Spotify's database
- **Complete Playlist Creation** - Automatically adds ALL songs from an artist to a new playlist
- **Real-time Feedback** - Loading indicators and progress bars for playlist creation
- **Responsive Design** - Clean, modern interface that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React** - Modern UI library
- **Vite** - Fast development and build tool
- **CSS-in-JS** - Organized styling approach

### Backend
- **Flask** - Python web framework
- **Spotipy** - Python Spotify Web API wrapper
- **Flask-CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Spotify Developer Account

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/jormyy/loyal-listener.git
cd loyal-listener
```

### 2. Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production URL (for deployment)

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```env
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
```

Run the backend:
```bash
python app.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173
VITE_BACKEND_URL=http://127.0.0.1:5000
```

Run the frontend:
```bash
npm run dev
```

## 📡 API Endpoints

### Backend Routes
- `GET /api/artist_search?artist_name={name}` - Search for artists
- `GET /api/albums?artist_id={id}` - Get artist's albums
- `GET /api/songs?album_id={id}` - Get album tracks
- `POST /api/create_playlist` - Create playlist with all artist songs

## 🚀 Deployment

### Frontend (Vercel)
1. Install Vercel CLI: `npm install -g vercel`
2. In frontend folder: `vercel`
3. Add environment variables in Vercel dashboard
4. Update Spotify redirect URIs with your Vercel URL

### Backend (Render)
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Add environment variables: `CLIENT_ID`, `CLIENT_SECRET`

https://github.com/user-attachments/assets/a81e7543-7d5d-4cea-9b12-35e55a3b199f

