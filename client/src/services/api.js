const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('weather_token');

const headers = (withAuth = false) => {
    const h = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
};

// ===== AUTH =====
export const signup = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('weather_token', data.token);
    localStorage.setItem('weather_user', JSON.stringify(data));
    return data;
};

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('weather_token', data.token);
    localStorage.setItem('weather_user', JSON.stringify(data));
    return data;
};

export const logout = () => {
    localStorage.removeItem('weather_token');
    localStorage.removeItem('weather_user');
};

export const getProfile = async () => {
    const res = await fetch(`${API_URL}/api/auth/profile`, { headers: headers(true) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

// ===== WEATHER =====
export const getWeather = async (city, unit = 'celsius') => {
    const res = await fetch(`${API_URL}/api/weather/${encodeURIComponent(city)}?unit=${unit}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getWeatherByCoords = async (lat, lon, unit = 'celsius') => {
    const res = await fetch(`${API_URL}/api/weather/coords?lat=${lat}&lon=${lon}&unit=${unit}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const searchCities = async (query) => {
    const res = await fetch(`${API_URL}/api/weather/search/${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

// ===== SAVED CITIES =====
export const getSavedCities = async () => {
    const res = await fetch(`${API_URL}/api/auth/cities`, { headers: headers(true) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const saveCity = async (cityData) => {
    const res = await fetch(`${API_URL}/api/auth/cities`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(cityData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const removeCity = async (cityName) => {
    const res = await fetch(`${API_URL}/api/auth/cities/${encodeURIComponent(cityName)}`, {
        method: 'DELETE',
        headers: headers(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

// ===== TRAVEL PLANS =====
export const createTravelPlan = async (destination, travelDate) => {
    const res = await fetch(`${API_URL}/api/travel-plan`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ destination, travelDate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const getTravelPlans = async () => {
    const res = await fetch(`${API_URL}/api/travel-plan`, { headers: headers(true) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};

export const deleteTravelPlan = async (id) => {
    const res = await fetch(`${API_URL}/api/travel-plan/${id}`, {
        method: 'DELETE',
        headers: headers(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
};
