import './SearchBar.css';

export default function SearchBar({ query, onChange, onSearch, loading }) {
    return (
        <div className="search-bar">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search for an artist..."
                    className="search-input"
                    onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button
                    onClick={onSearch}
                    disabled={loading}
                    className={`search-button${loading ? ' search-button--loading' : ''}`}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </div>
    );
}
