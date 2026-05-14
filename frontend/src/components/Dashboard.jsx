import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import ArtistCard from './ArtistCard';
import { useArtistSearch } from '../hooks/useArtistSearch';
import { createPlaylist } from '../api/spotify';
import './Dashboard.css';

export default function Dashboard({ userProfile, accessToken, onLogout }) {
    const { searchQuery, setSearchQuery, searchResults, loading, searchArtists } = useArtistSearch();
    const [creatingPlaylist, setCreatingPlaylist] = useState(null);

    const handleCreatePlaylist = async (artistName, artistId) => {
        if (!userProfile?.id) {
            alert('Waiting for profile to load... please try again in a moment.');
            return;
        }

        setCreatingPlaylist(artistId);
        try {
            const data = await createPlaylist(accessToken, userProfile.id, artistName, artistId);
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

    return (
        <div className="dashboard">
            <ProfileHeader userProfile={userProfile} onLogout={onLogout} />

            <div className="content-wrapper">
                <h1 className="welcome-title">Welcome, {userProfile.display_name}!</h1>

                <SearchBar
                    query={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={searchArtists}
                    loading={loading}
                />

                {searchResults.length > 0 && (
                    <>
                        <p className="instruction-text">
                            Click on an artist to enjoy all their songs!
                        </p>
                        <div className="results-container">
                            <div className="results-grid">
                                {searchResults.map((artist) => (
                                    <ArtistCard
                                        key={artist.id}
                                        artist={artist}
                                        isLoading={creatingPlaylist === artist.id}
                                        onClick={handleCreatePlaylist}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
