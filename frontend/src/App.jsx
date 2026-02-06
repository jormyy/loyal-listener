import { useState, useEffect, useRef, useCallback } from 'react';

const styles = {
    // login page styles
    loginContainer: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0
    },
    loginTitle: { 
        fontSize: '48px', 
        margin: '0 0 20px 0',
        textAlign: 'center'
    },
    loginCaption: { 
        fontSize: '16px', 
        color: '#666', 
        textAlign: 'center', 
        marginBottom: '30px',
        maxWidth: '400px',
        margin: '0 0 30px 0'
    },
    loginButton: {
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '25px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'transform 0.2s ease'
    },

    // main app styles
    mainContainer: {
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative'
    },
    profileSection: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 10
    },
    profileImage: {
        width: '50px', 
        height: '50px', 
        borderRadius: '50%'
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        cursor: 'pointer'
    },
    contentWrapper: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
        maxWidth: '900px',
        textAlign: 'center'
    },
    welcomeTitle: {
        marginBottom: '30px'
    },
    searchSection: {
        marginBottom: '30px'
    },
    searchTitle: {
        marginBottom: '20px'
    },
    searchInputContainer: {
        display: 'flex', 
        gap: '10px', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    searchInput: {
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ccc',
        width: '300px',
        fontSize: '16px'
    },
    searchButton: {
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '20px',
        fontSize: '16px',
        cursor: 'pointer'
    },
    instructionText: {
        fontSize: '16px', 
        color: '#666', 
        marginBottom: '30px'
    },
    resultsContainer: {
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center'
    },
    resultsGrid: {
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%',
        maxWidth: '700px'
    },
    artistCard: {
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '15px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
    },
    artistImage: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        marginBottom: '10px'
    },
    artistName: {
        margin: '10px 0',
        color: '#000000'
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px'
    },
    progressBar: {
        width: '80%',
        height: '4px',
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '10px'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1DB954',
        animation: 'progress 2s infinite linear'
    },
    loadingText: {
        fontSize: '12px',
        color: '#666',
        fontWeight: 'bold'
    }
};

export default function App() {
    const [accessToken, setAccessToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creatingPlaylist, setCreatingPlaylist] = useState(null);

    // progress bar animation
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const scopes = 'user-read-private user-read-email playlist-modify-public';

    const fetchUserProfileFromBackend = useCallback(async (code) => {
        try {
            const response = await fetch(`${backendUrl}/api/get_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });
            const userData = await response.json();
            
            if (userData.error) {
                console.error('Backend Profile Error:', userData.error);
                handleLogout(); 
            } else {
                setUserProfile(userData);
            }
        } catch (error) {
            console.error('Error connecting to backend for profile:', error);
        }
    }, [backendUrl]);

    const hasFetched = useRef(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code && !accessToken && !hasFetched.current) {
            hasFetched.current = true; // Lock it!
            setAccessToken(code);
            fetchUserProfileFromBackend(code);
            window.history.replaceState({}, document.title, "/"); 
        }
    }, [accessToken, fetchUserProfileFromBackend]);

        const handleLogin = () => {
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
            window.location.href = authUrl;
        };

    const handleLogout = () => {
        setAccessToken(null);
        setUserProfile(null);
        setSearchResults([]);
        setSearchQuery('');
        setCreatingPlaylist(null);
    };

    const searchArtists = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/artist_search?artist_name=${encodeURIComponent(searchQuery)}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.error) {
                console.error('Backend error:', data.error);
                setSearchResults([]);
            } else {
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Error searching artists:', error);
            setSearchResults([]);
        }
        setLoading(false);
    };

    const createPlaylist = async (artistName, artistId) => {
        if (!userProfile || !userProfile.id) {
            alert("Waiting for profile to load... please try again in a moment.");
            return;
        }

        setCreatingPlaylist(artistId);
        
        try {
            const response = await fetch(`${backendUrl}/api/create_playlist`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_token: accessToken,
                    user_id: userProfile.id,
                    artist_name: artistName,
                    artist_id: artistId
                })
            });

            const data = await response.json();
            
            if (data.error) {
                alert(`Error creating playlist: ${data.error}`);
            } else {
                alert(`Created playlist: "${artistName} enthusiast" with ${data.tracks_added} songs!`);
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert('Error creating playlist');
        } finally {
            setCreatingPlaylist(null);
        }
    };

    // UI rendering logic
    if (accessToken && userProfile) {
        return (
            <div style={styles.mainContainer}>
                <div style={styles.profileSection}>
                    {userProfile.images && userProfile.images[0] && (
                        <img 
                            src={userProfile.images[0].url} 
                            alt="Profile" 
                            style={styles.profileImage}
                        />
                    )}
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>

                <div style={styles.contentWrapper}>
                    <h1 style={styles.welcomeTitle}>Welcome, {userProfile.display_name}!</h1>

                    <div style={styles.searchSection}>
                        <div style={styles.searchInputContainer}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for an artist..."
                                style={styles.searchInput}
                                onKeyPress={(e) => e.key === 'Enter' && searchArtists()}
                            />
                            <button
                                onClick={searchArtists}
                                disabled={loading}
                                style={{
                                    ...styles.searchButton,
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    {searchResults.length > 0 && (
                        <p style={styles.instructionText}>
                            Click on an artist to enjoy all their songs!
                        </p>
                    )}

                    {searchResults.length > 0 && (
                        <div style={styles.resultsContainer}>
                            <div style={styles.resultsGrid}>
                                {searchResults.map((artist) => (
                                    <div 
                                        key={artist.id} 
                                        onClick={() => creatingPlaylist !== artist.id && createPlaylist(artist.name, artist.id)}
                                        onMouseEnter={(e) => creatingPlaylist !== artist.id && (e.currentTarget.style.transform = 'scale(1.05)')}
                                        onMouseLeave={(e) => creatingPlaylist !== artist.id && (e.currentTarget.style.transform = 'scale(1)')}
                                        style={{
                                            ...styles.artistCard,
                                            position: 'relative',
                                            cursor: creatingPlaylist === artist.id ? 'not-allowed' : 'pointer',
                                            opacity: creatingPlaylist === artist.id ? 0.7 : 1
                                        }}
                                    >
                                        <img 
                                            src={artist.image} 
                                            alt={artist.name}
                                            style={styles.artistImage}
                                        />
                                        <h4 style={styles.artistName}>{artist.name}</h4>
                                        
                                        {creatingPlaylist === artist.id && (
                                            <div style={styles.loadingOverlay}>
                                                <div style={styles.progressBar}>
                                                    <div 
                                                        style={{
                                                            ...styles.progressBarFill,
                                                            animation: 'progress 1.5s infinite ease-in-out'
                                                        }}
                                                    />
                                                </div>
                                                <span style={styles.loadingText}>Creating playlist...</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.loginContainer}>
            <h1 style={styles.loginTitle}>Loyal Listener</h1>
            <p style={styles.loginCaption}>
                When you can't seem to get enough of your favorite artists
            </p>
            <button 
                onClick={handleLogin}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                style={styles.loginButton}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Login with Spotify
            </button>
        </div>
    );
}