from flask import Flask, jsonify, request
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

client_credentials_manager = SpotifyClientCredentials(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)

sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

def artist_search(artist_name="keshi"):
    try:
        results = sp.search(q=artist_name, type="artist", limit=20)["artists"]["items"]
        artists = []
        
        for artist in results:
            image = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
            if artist["images"]:
                image = artist["images"][0]["url"]
                
            artists.append({
                    "id": artist["id"],
                    "name": artist["name"],
                    "image": image
                })
            
        return artists
    except Exception as e:
        return {"error": str(e)}

def albums(artist_id="3pc0bOVB5whxmD50W79wwO"):
    try:
        results = sp.artist_albums(artist_id=artist_id, album_type="album,single", limit=50)["items"]
        albums = [album["id"] for album in results]
        return albums
    except Exception as e:
        return {"error": str(e)}

def songs(album_id="1Flt7AQr1HDhdWuZVF26d4"):
    try:
        results = sp.album_tracks(album_id=album_id, limit=50)["items"]
        return results
    except Exception as e:
        return {"error": str(e)}

def create_playlist(user_token, user_id, artist_name):
    try:
        # create new spotify client w user token
        user_sp = spotipy.Spotify(auth=user_token)
        playlist_name = f"{artist_name} enthusiast"
        playlist = user_sp.user_playlist_create(
            user=user_id,
            name=playlist_name,
            public=True,
            collaborative=False,
            description=''
        )
        return playlist
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
        
        unique_track_ids = list(set(all_track_ids))
        
        return unique_track_ids
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

@app.route('/')
def home():
    return jsonify({"message": "Spotify API is running"})

@app.route('/api/artist_search')
def api_artist_search():
    artist_name = request.args.get('artist_name', 'keshi')
    return jsonify(artist_search(artist_name))

@app.route('/api/albums')
def api_albums():
    artist_id = request.args.get('artist_id', '3pc0bOVB5whxmD50W79wwO')
    return jsonify(albums(artist_id))

@app.route('/api/songs')
def api_songs():
    album_id = request.args.get('album_id', '1Flt7AQr1HDhdWuZVF26d4')
    return jsonify(songs(album_id))

@app.route('/api/create_playlist', methods=['POST'])
def api_create_playlist():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "JSON data required"}), 400
    
    user_token = data.get('user_token')
    user_id = data.get('user_id')
    artist_name = data.get('artist_name')
    artist_id = data.get('artist_id')
    
    if not user_token or not user_id or not artist_name or not artist_id:
        return jsonify({"error": "user_token, user_id, artist_name and artist_id are required"}), 400
    
    playlist_result = create_playlist(user_token, user_id, artist_name)
    if "error" in playlist_result:
        return jsonify(playlist_result), 500
    
    track_ids = get_all_artist_songs(artist_id)
    if isinstance(track_ids, dict) and "error" in track_ids:
        return jsonify(track_ids), 500
    
    if track_ids:
        add_result = add_songs_to_playlist(user_token, playlist_result["id"], track_ids)
        if "error" in add_result:
            return jsonify(add_result), 500
        
        return jsonify({
            "playlist": playlist_result,
            "tracks_added": add_result["tracks_added"]
        })
    else:
        return jsonify({
            "playlist": playlist_result,
            "tracks_added": 0
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)