const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function fetchUserProfile(code) {
    const response = await fetch(`${backendUrl}/api/get_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return response.json();
}

export async function searchArtists(query) {
    const response = await fetch(
        `${backendUrl}/api/artist_search?artist_name=${encodeURIComponent(query)}`,
        { credentials: 'include' }
    );
    return response.json();
}

export async function createPlaylist(userToken, userId, artistName, artistId) {
    const response = await fetch(`${backendUrl}/api/create_playlist`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_token: userToken,
            user_id: userId,
            artist_name: artistName,
            artist_id: artistId
        })
    });
    return response.json();
}
