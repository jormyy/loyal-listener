import { useState } from 'react';
import { searchArtists as searchArtistsApi } from '../api/spotify';

export function useArtistSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchArtists = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const data = await searchArtistsApi(searchQuery);
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

    return { searchQuery, setSearchQuery, searchResults, loading, searchArtists };
}
