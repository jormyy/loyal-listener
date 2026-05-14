import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchUserProfile } from '../api/spotify';

export function useSpotifyAuth() {
    const [accessToken, setAccessToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const hasFetched = useRef(false);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const scopes = 'user-read-private user-read-email playlist-modify-public';

    const handleLogout = useCallback(() => {
        setAccessToken(null);
        setUserProfile(null);
    }, []);

    const handleLogin = useCallback(() => {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        window.location.href = authUrl;
    }, [clientId, redirectUri, scopes]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code && !accessToken && !hasFetched.current) {
            hasFetched.current = true;
            setAccessToken(code);
            fetchUserProfile(code)
                .then(userData => {
                    if (userData.error) {
                        console.error('Backend Profile Error:', userData.error);
                        handleLogout();
                    } else {
                        setUserProfile(userData);
                    }
                })
                .catch(error => {
                    console.error('Error connecting to backend for profile:', error);
                });
            window.history.replaceState({}, document.title, '/');
        }
    }, [accessToken, handleLogout]);

    return { accessToken, userProfile, handleLogin, handleLogout };
}
