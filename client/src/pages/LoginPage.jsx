import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await apiLogin(email, password);
            loginUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Background orbs */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="glass-card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🌦️</span>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Sign in to your SkyPulse dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Signing in...' : '🔓 Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
