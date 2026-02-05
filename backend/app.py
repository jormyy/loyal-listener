from flask import Flask, jsonify, request
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

app = Flask(__name__)

# 1. Professional CORS Setup
# This allows your Vercel frontend to send cookies and JSON to this AWS backend
CORS(app, 
     supports_credentials=True, 
     origins=["https://loyal-listener.vercel.app"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

# Environment Variables
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
SECRET_KEY = os.getenv("SECRET_KEY")
REDIRECT_URI = os.getenv("REDIRECT_URI") # Must be https://loyal-listener.vercel.app/callback

app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True,
    SECRET_KEY=SECRET_KEY
)

# Standard client for searching (doesn't need user login)
client_credentials_manager = SpotifyClientCredentials(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# --- Helper Functions ---

def artist_search(artist_name="keshi"):
    try:
        results = sp.search(q=artist_name, type="artist", limit=20)["artists"]["items"]
        artists = []
        for artist in results:
            image = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
            if artist["images"]:
                image = artist["images"][0]["url"]
            artists.append({"id": artist["id"], "name": artist["name"], "image": image})
        return artists
    except Exception as e:
        return {"error": str(e)}

def get_all_artist_songs(artist_id):
    try:
        albums_result = sp.artist_albums(artist_id=artist_id, album_type="album,single", limit=50)["items"]
        all_track_ids = []
        for album in albums_result:
            tracks = sp.album_tracks(album_id=album["id"], limit=50)["items"]
            for track in tracks:
                if any(artist["id"] == artist_id for artist in track["artists"]):
                    all_track_ids.append(track["id"])
        return list(set(all_track_ids))
    except Exception as e:
        return {"error": str(e)}

def create_user_playlist(user_token, user_id, artist_name):
    try:
        user_sp = spotipy.Spotify(auth=user_token)
        playlist_name = f"{artist_name} enthusiast"
        return user_sp.user_playlist_create(
            user=user_id,
            name=playlist_name,
            public=True,
            description='Created via Loyal Listener'
        )
    except Exception as e:
        return {"error": str(e)}

def add_songs_to_playlist(user_token, playlist_id, track_ids):
    try:
        user_sp = spotipy.Spotify(auth=user_token)
        for i in range(0, len(track_ids), 100):
            batch = track_ids[i:i+100]
            user_sp.playlist_add_items(playlist_id, batch)
        return {"success": True, "tracks_added": len(track_ids)}
    except Exception as e:
        return {"error": str(e)}

# --- API Routes ---

@app.route('/')
def home():
    return jsonify({"message": "Spotify API is running on AWS"})

@app.route('/api/get_profile', methods=['POST'])
def get_profile():
    data = request.get_json()
    auth_code = data.get('code')
    
    sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri="https://loyal-listener.vercel.app/callback",
        scope="user-read-private user-read-email playlist-modify-public"
    )

    try:
        # Exchange code for token
        print(f"DEBUG: Attempting swap with Redirect URI: {REDIRECT_URI}")
        token_info = sp_oauth.get_access_token(auth_code, as_dict=True)
        access_token = token_info['access_token']
        
        # Use token to get profile
        user_sp = spotipy.Spotify(auth=access_token)
        profile = user_sp.current_user()
        
        return jsonify(profile)
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/artist_search')
def api_artist_search():
    artist_name = request.args.get('artist_name', 'keshi')
    return jsonify(artist_search(artist_name))

@app.route('/api/create_playlist', methods=['POST', 'OPTIONS'])
def api_create_playlist():
    # Handle Preflight
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    print(f"DEBUG: Received data: {data}")
    
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    auth_code = data.get('user_token') # This is the 'code' from React
    user_id = data.get('user_id')
    artist_name = data.get('artist_name')
    artist_id = data.get('artist_id')
    
    if not all([auth_code, user_id, artist_name, artist_id]):
        return jsonify({"error": "Missing required fields"}), 400

    # 2. Token Swap: Exchange auth_code for real access_token
    sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope="playlist-modify-public"
    )

    try:
        token_info = sp_oauth.get_access_token(auth_code, as_dict=True)
        access_token = token_info['access_token']
    except Exception as e:
        print(f"Token swap failed: {e}")
        return jsonify({"error": "Session expired. Please log in again."}), 401

    # 3. Create Playlist & Add Songs
    playlist = create_user_playlist(access_token, user_id, artist_name)
    if "error" in playlist:
        return jsonify(playlist), 500
    
    track_ids = get_all_artist_songs(artist_id)
    if isinstance(track_ids, list) and track_ids:
        add_result = add_songs_to_playlist(access_token, playlist["id"], track_ids)
        return jsonify({
            "playlist": playlist,
            "tracks_added": add_result.get("tracks_added", 0)
        })
    
    return jsonify({"playlist": playlist, "tracks_added": 0})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)