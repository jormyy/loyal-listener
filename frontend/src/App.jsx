import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
    const { accessToken, userProfile, handleLogin, handleLogout } = useSpotifyAuth();

    if (accessToken && userProfile) {
        return (
            <Dashboard
                userProfile={userProfile}
                accessToken={accessToken}
                onLogout={handleLogout}
            />
        );
    }

    return <LoginPage onLogin={handleLogin} />;
}
