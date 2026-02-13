import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <span className="text-2xl">🌦️</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            SkyPulse
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard')
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    🏠 Dashboard
                                </Link>
                                <Link
                                    to="/travel"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/travel')
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    ✈️ Travel
                                </Link>
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <span className="text-xs text-gray-500 hidden sm:block">{user.email}</span>
                                <button
                                    onClick={logoutUser}
                                    className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
