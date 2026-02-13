import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTravelPlan, getTravelPlans, deleteTravelPlan } from '../services/api';

export default function TravelPlannerPage() {
    const { user } = useAuth();
    const [destination, setDestination] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await getTravelPlans();
            setPlans(data);
        } catch { }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setCreating(true);
        try {
            await createTravelPlan(destination, travelDate);
            setSuccess('✅ Travel plan created!');
            setDestination(''); setTravelDate('');
            loadPlans();
        } catch (err) {
            setError(err.message);
        }
        setCreating(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteTravelPlan(id);
            setPlans(plans.filter(p => p._id !== id));
        } catch { }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        if (score >= 20) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-green-500';
        if (score >= 40) return 'bg-yellow-500';
        if (score >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getInsightIcon = (type) => {
        const icons = { heat: '🔥', cold: '🥶', rain: '🌧️', wind: '💨', uv: '☀️', good: '✅' };
        return icons[type] || '📋';
    };

    const getLevelColor = (level) => {
        if (level === 'high') return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (level === 'moderate') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    };

    // Min date = today, max date = 6 days from now
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">✈️</span>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Travel Weather Planner
                    </h1>
                    <p className="text-gray-400 text-sm">Plan your trips with AI-powered weather insights</p>
                </div>
            </div>

            {/* Create Plan Form */}
            <div className="glass-card mb-8">
                <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">🗺️ Plan a New Trip</h2>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1.5">Destination</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Tokyo, Paris, New York..."
                            required
                        />
                    </div>
                    <div className="sm:w-48">
                        <label className="block text-xs text-gray-400 mb-1.5">Travel Date</label>
                        <input
                            type="date"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            min={today}
                            max={maxDate}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap disabled:opacity-50">
                            {creating ? '⏳ Analyzing...' : '🚀 Get Weather Score'}
                        </button>
                    </div>
                </form>

                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-4 text-red-300 text-sm">{error}</div>}
                {success && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mt-4 text-emerald-300 text-sm">{success}</div>}
            </div>

            {/* Travel Plans */}
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">📋 Your Travel Plans</h2>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading plans...</div>
            ) : plans.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <span className="text-5xl block mb-4">🧳</span>
                    <p className="text-gray-400">No travel plans yet. Create your first trip above!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {plans.map(plan => (
                        <div key={plan._id} className="glass-card">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Weather Score */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold ${getScoreColor(plan.weatherScore)} border-2`}
                                        style={{ borderColor: 'currentColor' }}>
                                        {plan.weatherScore}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">Weather Score</span>
                                    <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${getScoreBg(plan.weatherScore)} transition-all duration-1000`}
                                            style={{ width: `${plan.weatherScore}%` }}></div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold">{plan.destination}{plan.country ? `, ${plan.country}` : ''}</h3>
                                            <p className="text-gray-400 text-sm">
                                                📅 {new Date(plan.travelDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDelete(plan._id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Delete">🗑️</button>
                                    </div>

                                    {/* Weather Summary */}
                                    {plan.weatherData && (
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {[
                                                { icon: '🌡️', val: `${Math.round(plan.weatherData.tempMax)}° / ${Math.round(plan.weatherData.tempMin)}°` },
                                                { icon: '🌧️', val: `${plan.weatherData.precipitationProbability}% rain` },
                                                { icon: '💨', val: `${Math.round(plan.weatherData.windSpeed)} km/h` },
                                                { icon: '☀️', val: `UV ${plan.weatherData.uvIndex}` },
                                                { icon: '📝', val: plan.weatherData.description },
                                            ].map((d, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white/5 rounded-lg text-xs text-gray-300 flex items-center gap-1">
                                                    {d.icon} {d.val}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Insights */}
                                    {plan.insights?.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-3">
                                            {plan.insights.map((insight, i) => (
                                                <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm border ${getLevelColor(insight.level)}`}>
                                                    <span>{getInsightIcon(insight.type)}</span>
                                                    <span>{insight.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
