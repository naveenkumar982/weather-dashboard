# ☁️ SkyPulse — Weather Intelligence Dashboard

A full-stack weather intelligence platform with real-time weather data, travel planning with AI-powered insights, and personalized city tracking.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

## ✨ Features

- 🌡️ **Real-time Weather** — Current conditions, hourly & 7-day forecasts powered by Open-Meteo
- 🌍 **City Search** — Search any city globally with autocomplete suggestions
- 📍 **Geolocation** — Auto-detect your current location's weather
- 💨 **Air Quality Index** — PM2.5, PM10, ozone, and more pollutant data
- ⭐ **Saved Cities** — Save favorite cities for quick access
- ✈️ **Travel Planner** — Plan trips with weather scores and smart insights (heat, rain, UV, wind risks)
- 🔒 **JWT Authentication** — Secure signup/login with encrypted passwords
- 📱 **Responsive Design** — Works beautifully on desktop and mobile
- 🌙 **Dark Theme** — Sleek dark mode UI throughout

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Weather API | Open-Meteo (free, no key needed) |
| Deployment | Vercel (frontend) + Render (backend) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account ([free tier](https://www.mongodb.com/atlas))

### 1. Clone the repo
```bash
git clone https://github.com/naveenkumar982/weather-dashboard.git
cd weather-dashboard
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173` in your browser.

## 📁 Project Structure

```
weather-dashboard/
├── server/                   # Express.js Backend
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   │   ├── userController.js
│   │   ├── weatherController.js
│   │   └── travelController.js
│   ├── middleware/            # JWT auth middleware
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── SavedLocation.js
│   │   └── TravelPlan.js
│   ├── routes/               # API route definitions
│   ├── services/             # Weather service (Open-Meteo)
│   └── server.js             # App entry point
│
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context provider
│   │   ├── pages/            # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── TravelPlannerPage.jsx
│   │   ├── services/api.js   # API client
│   │   └── utils/            # Weather code mappings
│   └── index.html
│
└── index.html                # Legacy standalone version
```

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| GET | `/api/auth/cities` | Get saved cities | ✅ |
| POST | `/api/auth/cities` | Save a city | ✅ |
| DELETE | `/api/auth/cities/:name` | Remove saved city | ✅ |
| GET | `/api/weather/:city` | Get weather by city | ❌ |
| GET | `/api/weather/coords` | Get weather by lat/lon | ❌ |
| GET | `/api/weather/search/:q` | Search cities | ❌ |
| POST | `/api/travel-plan` | Create travel plan | ✅ |
| GET | `/api/travel-plan` | Get travel plans | ✅ |
| DELETE | `/api/travel-plan/:id` | Delete travel plan | ✅ |

## 🔑 Environment Variables

### Backend (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/weatherdb
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```
VITE_API_URL=http://localhost:5000
```

## 👤 Author

**Naveen Kumar** — 3rd Year BE Student & Full-Stack Developer

- GitHub: [@naveenkumar982](https://github.com/naveenkumar982)
- Portfolio: [naveenkumar.is-a.dev](https://naveenkumar.is-a.dev)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
