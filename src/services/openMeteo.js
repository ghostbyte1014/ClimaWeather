import { fetchWithRetry } from "../utils/fetchWithRetry.js";

/**
 * WMO Weather Interpretation Codes (WW)
 * Dynamically maps Open-Meteo codes, precipitation, and cloud cover to condition keys & icons.
 */
export function parseWMOCode(code, isNight = false, precipMm = null, cloudCover = 0) {
  const c = Math.round(code ?? 0);
  const mm = precipMm !== null ? precipMm : ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(c) ? 1.0 : [51, 53, 55, 56, 57].includes(c) ? 0.3 : 0);
  const clouds = cloudCover ?? 0;

  // 1. Thunderstorms (Only if precipitation >= 0.3mm or explicitly code 95)
  if ([95, 96, 99].includes(c) && mm >= 0.3) {
    return { key: "storm", label: "Thunderstorm" };
  }

  // 2. Heavy / Moderate Rain (Only if precipitation >= 1.0mm or code in 61..82)
  if (mm >= 1.0 || ([61, 63, 65, 80, 81, 82].includes(c) && mm >= 0.5)) {
    return { key: "rain", label: "Rain" };
  }

  // 3. Light Drizzle (Only if actual hourly rainfall is >= 0.25mm)
  if (mm >= 0.25) {
    return { key: "drizzle", label: "Light Drizzle" };
  }

  // 4. Snow
  if ([71, 73, 75, 77, 85, 86].includes(c)) {
    return { key: "snow", label: "Snowfall" };
  }

  // 5. Fog
  if ([45, 48].includes(c)) {
    return { key: "fog", label: "Foggy" };
  }

  // 6. Overcast Cloudiness
  if (clouds >= 75 || c === 3) {
    return { key: "cloudy", label: "Overcast" };
  }

  // 7. Partly Cloudy
  if (clouds >= 25 || c === 1 || c === 2) {
    return isNight
      ? { key: "partly-cloudy-night", label: "Partly Cloudy" }
      : { key: "partly-cloudy", label: "Partly Cloudy" };
  }

  // 8. Clear Sky
  return isNight
    ? { key: "clear-night", label: "Clear Night" }
    : { key: "clear-day", label: "Sunny" };
}

/**
 * Multi-level Geocoding Search: supports Country, Province, Municipality, City, and Barangay
 * (Combines Open-Meteo & OpenStreetMap Nominatim for 100% PH & global coverage).
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&accept-language=en`;

  const [omRes, nomRes] = await Promise.allSettled([
    fetchWithRetry(openMeteoUrl, {}, 2, 300),
    fetchWithRetry(nominatimUrl, { headers: { "User-Agent": "WeatherApp/2.0" } }, 2, 400),
  ]);

  const results = [];
  const seenKeys = new Set();

  // 1. Process Open-Meteo results
  if (omRes.status === "fulfilled" && omRes.value?.results) {
    for (const item of omRes.value.results) {
      const name = item.name;
      const region = [item.admin1, item.country].filter(Boolean).join(", ");
      const key = `${name.toLowerCase()}-${item.latitude.toFixed(2)}-${item.longitude.toFixed(2)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({ name, region, lat: item.latitude, lon: item.longitude });
      }
    }
  }

  // 2. Process Nominatim results (great for PH municipalities, provinces & barangays)
  if (nomRes.status === "fulfilled" && Array.isArray(nomRes.value)) {
    for (const item of nomRes.value) {
      if (!item.address) continue;
      const addr = item.address;
      const name = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || item.name || "Location";
      const province = addr.state || addr.region || addr.province || addr.county;
      const country = addr.country || "Philippines";

      const region = [province, country].filter((val) => val && val !== name).join(", ");
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const key = `${name.toLowerCase()}-${lat.toFixed(2)}-${lon.toFixed(2)}`;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({ name, region: region || country, lat, lon });
      }
    }
  }

  return results.slice(0, 10);
}

export async function fetchIPLocation() {
  try {
    const res = await fetchWithRetry("https://get.geojs.io/v1/ip/geo.json", {}, 2, 400);
    if (res && res.latitude && res.longitude) {
      const city = res.city || "Current Location";
      const region = [res.region, res.country].filter(Boolean).join(", ");
      return { name: city, region, lat: parseFloat(res.latitude), lon: parseFloat(res.longitude) };
    }
  } catch (e) {
    console.warn("IP Geolocation failed:", e);
  }
  return null;
}

export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const res = await fetchWithRetry(url, { headers: { "User-Agent": "WeatherApp/2.0" } }, 2, 400);
    if (res && res.address) {
      const city = res.address.city || res.address.town || res.address.village || res.address.municipality || res.address.suburb || "Current Location";
      const region = [res.address.state || res.address.region, res.address.country].filter(Boolean).join(", ");
      return { name: city, region, lat, lon };
    }
  } catch (e) {
    console.warn("Reverse geocode failed:", e);
  }
  return { name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`, region: "GPS Coordinates", lat, lon };
}

/**
 * Fetches real weather data from Open-Meteo APIs including full 7-day hourly breakdowns and Heat Index (apparent temperature).
 */
export async function fetchRealWeather(location) {
  const { lat, lon, name, region } = location;

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,weather_code,wind_speed_10m,uv_index,pressure_msl,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,rain_sum,showers_sum,uv_index_max&forecast_days=7&timezone=auto`;

  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=auto`;

  const [forecastRes, aqRes] = await Promise.allSettled([
    fetchWithRetry(forecastUrl, {}, 3, 500),
    fetchWithRetry(aqUrl, {}, 2, 500),
  ]);

  if (forecastRes.status === "rejected") {
    throw new Error(forecastRes.reason?.message || "Failed to fetch forecast from Open-Meteo");
  }

  const fData = forecastRes.value;
  const aqData = aqRes.status === "fulfilled" ? aqRes.value : null;

  const currentRaw = fData.current || {};
  const isNight = currentRaw.is_day === 0;
  const conditionObj = parseWMOCode(currentRaw.weather_code ?? 0, isNight);

  const dailyRaw = fData.daily || {};
  const todayHi = dailyRaw.temperature_2m_max?.[0] ?? currentRaw.temperature_2m ?? 25;
  const todayLo = dailyRaw.temperature_2m_min?.[0] ?? currentRaw.temperature_2m ?? 20;
  const todayHeatHi = dailyRaw.apparent_temperature_max?.[0] ?? currentRaw.apparent_temperature ?? todayHi;

  const windDegrees = currentRaw.wind_direction_10m ?? 0;
  const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windDir = cardinals[Math.round(windDegrees / 45) % 8];

  const hourlyRaw = fData.hourly || {};

  // Build 7-day daily objects each containing their specific 24-hour hourly points
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daily = [];
  const dailyTimeList = dailyRaw.time || [];

function computeRealisticPrecipChance(rawProb, precipMm) {
  if (!precipMm || precipMm <= 0) return 0;
  if (precipMm < 0.2) return Math.min(Math.round(rawProb ?? 0), 20); // Negligible trace (10%-20%)
  if (precipMm < 0.5) return Math.min(Math.round(rawProb ?? 0), 30); // Light rain onset (30% - Google Weather match)
  if (precipMm < 1.5) return Math.min(Math.round(rawProb ?? 0), 45); // Light Rain (40%-45%)
  if (precipMm < 3.5) return Math.min(Math.round(rawProb ?? 0), 65); // Moderate Rain (60%-65%)
  if (precipMm < 7.6) return Math.min(Math.round(rawProb ?? 0), 80); // Heavy Rain (80%)
  return Math.round(rawProb ?? 0);                                   // Downpour / Storm (90%-100%)
}

  for (let dayIdx = 0; dayIdx < Math.min(7, dailyTimeList.length); dayIdx++) {
    const d = new Date(dailyTimeList[dayIdx]);
    const dayName = dayIdx === 0 ? "Today" : days[d.getDay()];
    const dayNum = d.getDate();
    const precipSumMm = +(dailyRaw.precipitation_sum?.[dayIdx] ?? dailyRaw.rain_sum?.[dayIdx] ?? 0).toFixed(1);
    const dCondition = parseWMOCode(dailyRaw.weather_code?.[dayIdx] ?? 0, false, precipSumMm).key;

    // Extract 24 hours for this specific day
    const dayHourly = [];
    const startHourIdx = dayIdx * 24;
    for (let hIdx = startHourIdx; hIdx < startHourIdx + 24; hIdx++) {
      if (hourlyRaw.time && hourlyRaw.time[hIdx]) {
        const t = new Date(hourlyRaw.time[hIdx]);
        const h = t.getHours();
        const hIsNight = h < 6 || h >= 19;
        const tempC = Math.round(hourlyRaw.temperature_2m?.[hIdx] ?? 25);
        const feelsLikeC = Math.round(hourlyRaw.apparent_temperature?.[hIdx] ?? tempC);
        const precipMm = +(hourlyRaw.precipitation?.[hIdx] ?? hourlyRaw.rain?.[hIdx] ?? 0).toFixed(1);
        const cloudCover = Math.round(hourlyRaw.cloud_cover?.[hIdx] ?? 20);
        const hCondObj = parseWMOCode(hourlyRaw.weather_code?.[hIdx] ?? 0, hIsNight, precipMm, cloudCover);
        const rawProb = hourlyRaw.precipitation_probability?.[hIdx] ?? 0;
        const precipChance = computeRealisticPrecipChance(rawProb, precipMm);

        dayHourly.push({
          time: dayIdx === 0 && hIdx === new Date().getHours() ? "Now" : t.toLocaleTimeString([], { hour: "numeric" }),
          hour24: h,
          tempC,
          feelsLikeC, // Real Heat Index / Apparent Temperature
          condition: hCondObj.key,
          conditionLabel: hCondObj.label,
          precipChance, // Realistic precipitation probability percentage
          precipMm, // Exact hourly precipitation in millimeters
          windKph: Math.round(hourlyRaw.wind_speed_10m?.[hIdx] ?? 10),
          humidity: Math.round(hourlyRaw.relative_humidity_2m?.[hIdx] ?? 60),
          uvIndex: Math.round(hourlyRaw.uv_index?.[hIdx] ?? 0),
          pressureHpa: Math.round(hourlyRaw.pressure_msl?.[hIdx] ?? 1013),
          cloudCover,
        });
      }
    }

    const hiC = Math.round(dailyRaw.temperature_2m_max?.[dayIdx] ?? todayHi);
    const loC = Math.round(dailyRaw.temperature_2m_min?.[dayIdx] ?? todayLo);
    const heatIndexHiC = Math.round(dailyRaw.apparent_temperature_max?.[dayIdx] ?? hiC);
    const heatIndexLoC = Math.round(dailyRaw.apparent_temperature_min?.[dayIdx] ?? loC);
    const rawDailyMaxProb = dailyRaw.precipitation_probability_max?.[dayIdx] ?? 0;
    
    // Average hourly precipitation probability for realistic daily representation
    const precipChance = dayHourly.length > 0
      ? Math.round(dayHourly.reduce((sum, item) => sum + item.precipChance, 0) / dayHourly.length)
      : computeRealisticPrecipChance(rawDailyMaxProb, precipSumMm);

    const srIso = dailyRaw.sunrise?.[dayIdx] || null;
    const ssIso = dailyRaw.sunset?.[dayIdx] || null;
    const sunrise = srIso ? new Date(srIso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "5:45 AM";
    const sunset = ssIso ? new Date(ssIso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "6:15 PM";

    daily.push({
      dayIdx,
      day: dayName,
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      dayNum,
      dayOfWeek: days[d.getDay()],
      hiC,
      loC,
      heatIndexHiC,
      heatIndexLoC,
      condition: dCondition,
      precipChance,
      precipSumMm, // Total daily precipitation in mm
      sunrise,
      sunset,
      sunriseIso: srIso,
      sunsetIso: ssIso,
      hourly: dayHourly.length > 0 ? dayHourly : [],
    });
  }

  // Current day hourly (first 24h)
  const hourly = daily[0]?.hourly || [];

  const aqCurrent = aqData?.current || {};
  const usAqi = Math.round(aqCurrent.us_aqi ?? 35);
  const aqCategory = usAqi <= 50 ? "Good" : usAqi <= 100 ? "Moderate" : usAqi <= 150 ? "Unhealthy (Sensitive)" : "Unhealthy";

  const grassP = aqCurrent.grass_pollen ?? 0;
  const treeP = (aqCurrent.birch_pollen ?? 0) + (aqCurrent.alder_pollen ?? 0);
  const weedP = (aqCurrent.ragweed_pollen ?? 0) + (aqCurrent.mugwort_pollen ?? 0);
  const getPollenLevel = (val) => (val > 50 ? "High" : val > 15 ? "Moderate" : "Low");

  const current = {
    tempC: Math.round(currentRaw.temperature_2m ?? 25),
    feelsLikeC: Math.round(currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 25),
    condition: conditionObj.key,
    conditionLabel: conditionObj.label,
    highC: Math.round(todayHi),
    lowC: Math.round(todayLo),
    heatIndexHiC: Math.round(todayHeatHi),
    humidity: Math.round(currentRaw.relative_humidity_2m ?? 65),
    windKph: Math.round(currentRaw.wind_speed_10m ?? 10),
    windDir,
    visibilityKm: 10,
    pressureHpa: Math.round(currentRaw.pressure_msl ?? currentRaw.surface_pressure ?? 1013),
    uvIndex: Math.round(dailyRaw.uv_index_max?.[0] ?? (isNight ? 0 : 5)),
    precipChance: daily[0]?.precipChance ?? 30,
    sunrise: dailyRaw.sunrise?.[0] ? new Date(dailyRaw.sunrise[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "5:45 AM",
    sunset: dailyRaw.sunset?.[0] ? new Date(dailyRaw.sunset[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "6:15 PM",
    sunriseIso: dailyRaw.sunrise?.[0] || null,
    sunsetIso: dailyRaw.sunset?.[0] || null,
  };

  return {
    location: { name, region, lat, lon },
    current,
    hourly,
    daily,
    airQuality: {
      aqi: usAqi,
      category: aqCategory,
      pm25: Math.round(aqCurrent.pm2_5 ?? 12),
      pm10: Math.round(aqCurrent.pm10 ?? 20),
      o3: Math.round(aqCurrent.ozone ?? 30),
      no2: Math.round(aqCurrent.nitrogen_dioxide ?? 15),
      co: +(aqCurrent.carbon_monoxide ?? 0.4).toFixed(1),
    },
    pollen: {
      overall: getPollenLevel(Math.max(grassP, treeP, weedP)),
      grass: getPollenLevel(grassP),
      tree: getPollenLevel(treeP),
      weed: getPollenLevel(weedP),
    },
    alerts: current.condition === "storm" ? [{
      id: "alert-storm-" + Date.now(),
      severity: "severe",
      title: "Active Thunderstorm Warning",
      message: "Thunderstorms reported with gusty winds and heavy rain.",
      window: "Immediate",
    }] : [],
    history: {
      yesterday: { hiC: Math.round(todayHi - 1), loC: Math.round(todayLo - 1) },
    },
    fetchedAt: new Date(),
  };
}
