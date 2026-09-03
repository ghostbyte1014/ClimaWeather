# 🌤️ ClimaWeather

A real-time, offline-capable, responsive Web Application powered by **React 18**, **Vite**, **Open-Meteo APIs**, **Leaflet Maps**, **IndexedDB**, **PWA Service Worker**, and **Web Speech API**.

---

## ✨ Features

- **🌐 Real-Time Live Weather Data (Open-Meteo)**:
  - Real-time temperature, feels-like (Heat Index), humidity, pressure, wind velocity/direction, UV index, sunrise/sunset, 24-hour hourly trend, and 7-day daily forecast.
- **🇵🇭 Multi-Level Location Search**:
  - Search by **Country**, **Province**, **Municipality**, **City**, or **Barangay** (e.g. `Santa Maria Bulacan`, `Bocaue Bulacan`, `San Fernando Pampanga`, `Batangas`, `Tagaytay Cavite`).
- **📍 Dual Geolocation Engine**:
  - Primary browser GPS lookup + automatic CORS-friendly IP Geolocation fallback (`GeoJS`) when GPS permissions are blocked.
- **📅 7-Day Interactive Day Selector & Heat Index**:
  - Click any day in the 7-day carousel to inspect its 24-hour hourly breakdown.
  - Compare **Actual Temp** vs **Heat Index (Apparent Temperature)** curve for any hour.
- **📊 Dynamic Sub-Metric Filter Pills**:
  - Interactive pills (`Overview`, `Precipitation`, `Wind`, `Humidity`, `Cloud cover`, `Pressure`, `UV`, `Feels like`).
  - Morph-animates chart curves and displays exact rainfall volume in millimeters (`mm`) alongside probability percentage (`%`).
- **🗺️ Interactive Multi-Layer Map View**:
  - Toggle between **Street View** (CartoDB Voyager), **Dark View** (CartoDB Dark Matter), **Satellite View** (Esri ArcGIS), and **Terrain / Topo**.
- **💡 Beginner-Friendly Weather Glossary & AQI Meaning Guide**:
  - Includes plain-English explanations for every technical metric (Heat Index, UV Index, Barometric Pressure, Dew Point) and a full **Air Quality Health Guide** (AQI 0-500, PM2.5, PM10, O₃, NO₂, CO).
- **🎨 Glassmorphism & Animated Atmospheric Canvas**:
  - Dynamic ambient light aura orbs, falling rain splashes, drifting clouds, twinkling stars, and lightning flashes. Default dark theme.
- **🎙️ Web Speech Voice Search**:
  - Hands-free speech recognition ("What's the weather in Tokyo?").
- **💾 Offline Persistence & PWA**:
  - Native IndexedDB storage wrapper (`src/utils/db.js`) + Service Worker (`public/sw.js`) for offline availability and PWA installation.
- **🌍 Multi-Language Localization (i18n)**:
  - Supports English (EN), Tagalog (TL), Spanish (ES), French (FR), and German (DE).

---

## 🏗️ Project Architecture

```text
WeatherApp/
├── index.html                     # Responsive HTML entry point
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite bundler configuration
├── vercel.json                    # Vercel zero-config deployment manifest
├── README.md                      # Documentation
├── public/
│   ├── manifest.json              # Web App Manifest for PWA installation
│   └── sw.js                      # Service Worker for offline asset caching
├── src/
│   ├── components/
│   │   ├── Header.jsx             # Top bar navigation & action controls
│   │   ├── SearchBar.jsx          # Live search & voice recognition input
│   │   ├── HeroCard.jsx           # Main hero temperature & outfit advice
│   │   ├── DailyBriefing.jsx      # Accordion outlook summary
│   │   ├── MetricCard.jsx         # Individual metric card component
│   │   ├── MetricsGrid.jsx        # Quick metrics 6-card grid
│   │   ├── SegButton.jsx          # Tab navigation button component
│   │   ├── ConditionIcon.jsx      # Weather condition icon mapping
│   │   ├── WeatherAtmosphere.jsx  # Continuous time-of-day dynamic canvas particle engine
│   │   ├── WeatherGuideModal.jsx  # Plain-English weather glossary & info drawer
│   │   ├── SettingsDrawer.jsx     # Settings modal (i18n, theme, accessibility)
│   │   ├── ErrorBoundary.jsx      # React Error Boundary for fault tolerance
│   │   └── Tabs/
│   │       ├── TodayTab.jsx       # Day selector carousel, dynamic charts & 24h breakdown
│   │       ├── EnvironmentTab.jsx # Air quality index & pollutant glossary
│   │       ├── MapTab.jsx         # Interactive multi-layer Leaflet map
│   │       ├── HistoryTab.jsx     # Historical weather comparison
│   │       └── CompareTab.jsx     # Side-by-side city comparison
│   ├── constants/
│   │   └── conditionMeta.js       # Weather metadata, condition gradients & outfit logic
│   ├── hooks/
│   │   └── useVoiceSearch.js      # Web Speech API voice search hook
│   ├── services/
│   │   ├── openMeteo.js           # Real-time Open-Meteo & reverse geocoding API layer
│   │   └── openMeteo.test.js      # Automated unit test suite (8/8 passing)
│   └── utils/
│       ├── db.js                  # Native IndexedDB persistent offline storage
│       ├── fetchWithRetry.js      # Exponential backoff network retry utility
│       └── i18n.js                # Multi-language translation dictionary
└── weather-app.jsx                # Modular Root Component
```

---

## 🚀 Getting Started

### 1. Installation
Clone or download the project folder, then run:
```bash
npm install
```

### 2. Run Locally in Development Mode
Start the Vite development server on `http://localhost:3000`:
```bash
npm run dev
```

### 3. Run Automated Unit Tests
Verify data transformation, WMO weather code mapping, and API parsing:
```bash
node -e "import('./src/services/openMeteo.test.js')"
```

### 4. Build for Production
Generate optimized static bundle for deployment:
```bash
npm run build
```

---

## 🟢 100% Free API & Open-Source Stack ($0 Cost)

This project requires **no paid API keys or credit cards**:

- **Open-Meteo Forecast & Air Quality API**: 100% Free for non-commercial projects.
- **OpenStreetMap Nominatim Geocoding API**: 100% Free open-source location search.
- **GeoJS IP Geolocation API**: 100% Free HTTPS CORS-compliant IP lookup.
- **Leaflet & CartoDB / Esri Map Tiles**: 100% Free public map tiles.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
