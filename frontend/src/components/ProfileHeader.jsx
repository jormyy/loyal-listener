import './ProfileHeader.css';

export default function ProfileHeader({ userProfile, onLogout }) {
    return (
        <div className="profile-header">
            {userProfile.images?.[0] && (
                <img
                    src={userProfile.images[0].url}
                    alt="Profile"
                    className="profile-image"
                />
            )}
            <button onClick={onLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
}
