from requests import post, get, exceptions
import json


def get_auth_header(token):
    return {"Authorization": f"Bearer {token}"}

def search_for_artist(token, artist_name):
    url = "https://api.spotify.com/v1/search" # Assuming this is the correct mock/test URL
    headers = get_auth_header(token)
    # The API query itself likely provides some initial relevance sorting
    query = f"?q={artist_name}&type=artist"

    query_url = url + query
    try:
        result = get(query_url, headers=headers)
        result.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        json_result = json.loads(result.content)

        # Check if the expected data structure exists
        if "artists" not in json_result or "items" not in json_result["artists"]:
             print("Warning: Unexpected API response structure.")
             return None

        artists = json_result["artists"]["items"]

        if not artists:
            return None # No artists found

        # Find the artist with an exact name match (case-insensitive)
        exact_match_artist = None
        other_artists = []
        search_name_lower = artist_name.lower()

        for artist in artists:
            if artist.get("name", "").lower() == search_name_lower:
                exact_match_artist = artist
            else:
                other_artists.append(artist)

        # If an exact match was found, place it at the beginning of the list
        if exact_match_artist:
            # Combine the exact match with the other artists
            # The 'other_artists' list maintains the original relative order
            return [exact_match_artist] + other_artists
        else:
            # If no exact match, return the original list from the API
            # The API's default sorting is likely based on relevance
            return artists

    except exceptions.RequestException as e:
        print(f"Error during API request: {e}")
        return None
    except json.JSONDecodeError:
        print("Error decoding JSON response from API.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def artist_name(token, artist_id):
    url = f"https://api.spotify.com/v1/artists/{artist_id}"
    headers = get_auth_header(token)
    result = get(url, headers=headers)
    name = json.loads(result.content)["name"]
    return name

def get_albums_by_artist(token, artist_id):
    url = f"https://api.spotify.com/v1/artists/{artist_id}/albums?limit=50&include_groups=album,single"
    headers = get_auth_header(token)
    result = get(url, headers=headers)
    json_result = json.loads(result.content)["items"]
    return sorted(json_result, key=lambda x: x["release_date"])

def get_songs_from_album(token, album_id):
    url = f"https://api.spotify.com/v1/albums/{album_id}/tracks"
    headers = get_auth_header(token)
    result = get(url, headers=headers)
    json_result = json.loads(result.content)["items"]
    return json_result

def create_playlist(token, user_id, playlist_name):
    url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    data = json.dumps({
        "name": f"{playlist_name} enthusiast",
        "description": f"{playlist_name} playlist made by Loyal Listener",
    })
    result = post(url, data=data, headers=headers)
    json_result = json.loads(result.content)
    return json_result

def populate_playlist(token, playlist_id, uri_list):
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = get_auth_header(token)
    batch = []
    while uri_list:
        if len(batch) == 100:
            data = json.dumps({
                "uris": batch
            })
            post(url, data=data, headers=headers)
            batch = []
        batch.append(uri_list[0])
        uri_list.pop(0)
    if batch:
        data = json.dumps({
            "uris": batch
        })
        post(url, data=data, headers=headers)
    return 