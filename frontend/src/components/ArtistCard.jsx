import './ArtistCard.css';

export default function ArtistCard({ artist, isLoading, onClick }) {
    return (
        <div
            className={`artist-card${isLoading ? ' artist-card--loading' : ''}`}
            onClick={() => !isLoading && onClick(artist.name, artist.id)}
        >
            <img src={artist.image} alt={artist.name} className="artist-image" />
            <h4 className="artist-name">{artist.name}</h4>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" />
                    </div>
                    <span className="loading-text">Creating playlist...</span>
                </div>
            )}
        </div>
    );
}
