import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeather, getWeatherByCoords, searchCities as apiSearchCities, getSavedCities, saveCity, removeCity } from '../services/api';
import { WMO_CODES } from '../utils/weatherCodes';

export default function DashboardPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [unit, setUnit] = useState(localStorage.getItem('weatherUnit') || 'celsius');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [weather, setWeather] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [location, setLocation] = useState(null);
    const [savedCities, setSavedCitiesState] = useState([]);
    const debounceRef = useRef(null);

    useEffect(() => {
        loadSavedCities();
        getGeoLocation();
    }, []);

    const loadSavedCities = async () => {
        if (!user) return;
        try {
            const cities = await getSavedCities();
            setSavedCitiesState(cities);
        } catch { }
    };

    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
                () => fetchByCity('Bengaluru')
            );
        } else {
            fetchByCity('Bengaluru');
        }
    };

    const fetchByCity = async (city) => {
        setLoading(true);
        setError('');
        try {
            const data = await getWeather(city, unit);
            setWeather(data.weather);
            setAirQuality(data.airQuality);
            setLocation(data.location);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchByCoords = async (lat, lon) => {
        setLoading(true);
        setError('');
        try {
            const data = await getWeatherByCoords(lat, lon, unit);
            setWeather(data.weather);
            setAirQuality(data.airQuality);
            setLocation({ name: 'Your Location', country: '', lat, lon });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearch(q);
        clearTimeout(debounceRef.current);
        if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await apiSearchCities(q);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch { setSuggestions([]); }
        }, 300);
    };

    const selectCity = (loc) => {
        setSearch(loc.name);
        setShowSuggestions(false);
        setLocation({ name: loc.name, country: loc.country || '', lat: loc.latitude, lon: loc.longitude });
        fetchByCity(loc.name);
    };

    const handleSaveCity = async () => {
        if (!location || !user) return;
        try {
            const cities = await saveCity({ cityName: location.name, country: location.country, lat: location.lat, lon: location.lon });
            setSavedCitiesState(cities);
        } catch { }
    };

    const handleRemoveCity = async (cityName) => {
        try {
            const cities = await removeCity(cityName);
            setSavedCitiesState(cities);
        } catch { }
    };

    const toggleUnit = (u) => {
        setUnit(u);
        localStorage.setItem('weatherUnit', u);
        if (location?.name) fetchByCity(location.name);
    };

    const unitSym = unit === 'fahrenheit' ? '°F' : '°C';
    const speedUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';

    if (loading && !weather) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl animate-pulse mb-4">🌤️</div>
                    <p className="text-gray-400">Fetching live weather data...</p>
                </div>
            </div>
        );
    }

    const current = weather?.current;
    const hourly = weather?.hourly;
    const daily = weather?.daily;
    const air = airQuality?.current;
    const wmo = current ? (WMO_CODES[current.weather_code] || WMO_CODES[0]) : WMO_CODES[0];
    const isDay = current?.is_day === 1;
    const nowHour = new Date().getHours();

    // AQI helpers
    const getAqiInfo = (aqi) => {
        if (aqi <= 20) return { level: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500', advice: 'Air quality is ideal.' };
        if (aqi <= 40) return { level: 'Good', color: 'text-green-400', bg: 'bg-green-500', advice: 'Air quality is acceptable.' };
        if (aqi <= 60) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500', advice: 'Sensitive groups limit outdoor exposure.' };
        if (aqi <= 80) return { level: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500', advice: 'Reduce outdoor exertion.' };
        if (aqi <= 100) return { level: 'Very Poor', color: 'text-red-400', bg: 'bg-red-500', advice: 'Avoid outdoor activities.' };
        return { level: 'Hazardous', color: 'text-red-600', bg: 'bg-red-600', advice: 'Stay indoors. Health alert.' };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="🔍 Search any city..."
                        className="input-field"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                            {suggestions.map((s, i) => (
                                <div key={i} onClick={() => selectCity(s)}
                                    className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors">
                                    <span>📍</span>
                                    <span className="font-medium">{s.name}</span>
                                    <span className="text-gray-500 text-sm">{s.admin1 || ''}, {s.country || ''}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => search && fetchByCity(search)} className="btn-primary">Search</button>
                    <button onClick={getGeoLocation} className="btn-secondary" title="Use my location">📍</button>
                    <div className="flex bg-white/5 rounded-xl border border-white/[0.08] overflow-hidden">
                        <button onClick={() => toggleUnit('celsius')} className={`px-3 py-2 text-sm font-semibold transition-all ${unit === 'celsius' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>°C</button>
                        <button onClick={() => toggleUnit('fahrenheit')} className={`px-3 py-2 text-sm font-semibold transition-all ${unit === 'fahrenheit' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>°F</button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-300 text-sm">{error}</div>
            )}

            {/* Saved Cities */}
            {user && (
                <div className="glass-card !p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">📌 Saved Locations</span>
                        <button onClick={handleSaveCity} className="btn-secondary !px-3 !py-1.5 text-xs">+ Save Current</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {savedCities.length === 0 ? (
                            <span className="text-gray-500 text-sm">No saved locations yet</span>
                        ) : savedCities.map((c, i) => (
                            <div key={i} onClick={() => fetchByCity(c.cityName)}
                                className="px-3 py-1.5 bg-white/5 border border-white/[0.08] rounded-full cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-sm flex items-center gap-2">
                                📍 {c.cityName}
                                <span onClick={(e) => { e.stopPropagation(); handleRemoveCity(c.cityName); }}
                                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer">✕</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            {current && (
                <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
                    {/* Current Weather */}
                    <div className="glass-card lg:row-span-2">
                        <h2 className="text-2xl font-bold">{location?.name}{location?.country ? `, ${location.country}` : ''}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="text-center my-8">
                            <div className="text-8xl mb-4 drop-shadow-2xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
                                {isDay ? wmo.icon : wmo.night}
                            </div>
                            <div className="text-7xl font-extrabold">{Math.round(current.temperature_2m)}<span className="text-2xl text-gray-400">{unitSym}</span></div>
                            <p className="text-gray-400 text-lg mt-2 capitalize">{wmo.desc}</p>
                            <p className="text-gray-500 text-sm mt-1">Feels like {Math.round(current.apparent_temperature)}{unitSym}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '💧', label: 'Humidity', val: `${current.relative_humidity_2m}%` },
                                { icon: '💨', label: 'Wind', val: `${Math.round(current.wind_speed_10m)} ${speedUnit}` },
                                { icon: '👁️', label: 'Visibility', val: hourly?.visibility?.[nowHour] ? `${(hourly.visibility[nowHour] / 1000).toFixed(1)} km` : '--' },
                                { icon: '🌡️', label: 'Pressure', val: `${Math.round(current.pressure_msl)} hPa` },
                                { icon: '☁️', label: 'Cloud Cover', val: `${current.cloud_cover}%` },
                                { icon: '🌧️', label: 'Rain Chance', val: hourly?.precipitation_probability?.[nowHour] !== undefined ? `${hourly.precipitation_probability[nowHour]}%` : '--' },
                            ].map((d, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                    <span className="text-xl">{d.icon}</span>
                                    <div>
                                        <div className="text-[0.65rem] uppercase tracking-wider text-gray-500">{d.label}</div>
                                        <div className="font-semibold text-sm">{d.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Hourly */}
                        <div className="glass-card">
                            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">⏱️ 24-Hour Forecast</div>
                            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                                {hourly && Array.from({ length: 24 }, (_, i) => nowHour + i).filter(i => i < hourly.time.length).map((i, idx) => {
                                    const time = new Date(hourly.time[i]);
                                    const w = WMO_CODES[hourly.weather_code[i]] || WMO_CODES[0];
                                    const isD = hourly.is_day[i] === 1;
                                    const isNow = idx === 0;
                                    const rain = hourly.precipitation_probability[i];
                                    return (
                                        <div key={idx} className={`flex-shrink-0 text-center px-3 py-4 rounded-xl min-w-[70px] transition-all border
                      ${isNow ? 'border-blue-500/50 bg-blue-500/10' : 'border-transparent bg-white/[0.03] hover:border-blue-500/30 hover:-translate-y-0.5'}`}>
                                            <div className="text-xs text-gray-400 mb-2 font-medium">{isNow ? 'Now' : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</div>
                                            <div className="text-xl mb-2">{isD ? w.icon : w.night}</div>
                                            <div className="font-bold text-sm">{Math.round(hourly.temperature_2m[i])}°</div>
                                            {rain > 0 && <div className="text-xs text-blue-400 mt-1">💧{rain}%</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Daily */}
                        <div className="glass-card">
                            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">📅 7-Day Forecast</div>
                            <div className="flex flex-col gap-2">
                                {daily && (() => {
                                    const allT = [...daily.temperature_2m_max, ...daily.temperature_2m_min];
                                    const minT = Math.min(...allT), maxT = Math.max(...allT), range = maxT - minT || 1;
                                    return daily.time.map((t, i) => {
                                        const date = new Date(t);
                                        const w = WMO_CODES[daily.weather_code[i]] || WMO_CODES[0];
                                        const barLeft = ((daily.temperature_2m_min[i] - minT) / range) * 100;
                                        const barW = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / range) * 100;
                                        return (
                                            <div key={i} className="grid grid-cols-[90px_35px_1fr_80px] items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-xl border border-transparent hover:border-white/10 hover:translate-x-1 transition-all">
                                                <span className="font-semibold text-sm">{i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                <span className="text-lg text-center">{w.icon}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                                            style={{ marginLeft: `${barLeft}%`, width: `${Math.max(barW, 5)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <span className="font-bold">{Math.round(daily.temperature_2m_max[i])}°</span>
                                                    <span className="text-gray-500"> / {Math.round(daily.temperature_2m_min[i])}°</span>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Air Quality */}
                    {air && (
                        <div className="glass-card">
                            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">🫁 Air Quality Index</div>
                            {(() => {
                                const aqi = air.european_aqi || air.us_aqi || 0;
                                const info = getAqiInfo(aqi);
                                return (
                                    <>
                                        <div className="flex items-center gap-5 mb-4">
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold ${info.color} border-2`}
                                                style={{ borderColor: 'currentColor' }}>
                                                {aqi}
                                            </div>
                                            <div>
                                                <div className={`text-lg font-semibold ${info.color}`}>{info.level}</div>
                                                <div className="text-gray-400 text-sm">{info.advice}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'PM2.5', val: air.pm2_5?.toFixed(1) },
                                                { label: 'PM10', val: air.pm10?.toFixed(1) },
                                                { label: 'O₃', val: air.ozone?.toFixed(1) },
                                                { label: 'NO₂', val: air.nitrogen_dioxide?.toFixed(1) },
                                                { label: 'SO₂', val: air.sulphur_dioxide?.toFixed(1) },
                                                { label: 'CO', val: air.carbon_monoxide?.toFixed(0) },
                                            ].map((p, i) => (
                                                <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                                                    <div className="text-[0.6rem] uppercase text-gray-500 mb-1">{p.label}</div>
                                                    <div className="font-semibold text-sm">{p.val || '--'} <span className="text-[0.6rem] text-gray-500">µg/m³</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Sun Times + Map */}
                    <div className="glass-card">
                        <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">🌅 Sunrise & Sunset</div>
                        {daily?.sunrise && daily?.sunset && (() => {
                            const sr = new Date(daily.sunrise[0]);
                            const ss = new Date(daily.sunset[0]);
                            const noon = new Date((sr.getTime() + ss.getTime()) / 2);
                            return (
                                <>
                                    <div className="flex justify-between mt-2 text-center">
                                        <div>
                                            <div className="text-xs text-gray-500">Sunrise</div>
                                            <div className="font-semibold">{sr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Solar Noon</div>
                                            <div className="font-semibold">{noon.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Sunset</div>
                                            <div className="font-semibold">{ss.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        {location && (
                            <div className="mt-6">
                                <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">🗺️ Location Map</div>
                                <div className="rounded-xl overflow-hidden border border-white/[0.08] h-[250px]">
                                    <iframe
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.05}%2C${location.lat - 0.03}%2C${location.lon + 0.05}%2C${location.lat + 0.03}&layer=mapnik&marker=${location.lat}%2C${location.lon}`}
                                        className="w-full h-full border-0"
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes float { 50% { transform: translateY(-10px); } }`}</style>
        </div>
    );
}
