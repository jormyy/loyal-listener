import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import json
from dotenv import load_dotenv


load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

client_credentials_manager = SpotifyClientCredentials(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)

sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

def artist_search(artist_name="keshi"):
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

def albums(artist_id="3pc0bOVB5whxmD50W79wwO"):
    results = sp.artist_albums(artist_id=artist_id, album_type="album,single", limit=50)["items"]
    albums = [album["id"] for album in results]
    return albums

def songs(album_id="1Flt7AQr1HDhdWuZVF26d4"):
    results = sp.album_tracks(album_id=album_id, limit=50)["items"]
    return results

a = albums()
all_songs = set()
for i in a:
    for j in songs(i):
        all_songs.add((j["id"], j["name"]))
print(all_songs)