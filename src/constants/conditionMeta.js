import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Moon, CloudSun, CloudMoon
} from "lucide-react";

export const DEFAULT_CITIES = [
  { name: "Manila", region: "Metro Manila, PH", lat: 14.5995, lon: 120.9842 },
  { name: "San Jose del Monte", region: "Bulacan, PH", lat: 14.8136, lon: 121.0454 },
  { name: "Tokyo", region: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Singapore", region: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "New York", region: "NY, USA", lat: 40.7128, lon: -74.006 },
  { name: "London", region: "United Kingdom", lat: 51.5072, lon: -0.1276 },
];

export const CONDITION_META = {
  "clear-day": { Icon: Sun, gradientLight: ["#FFDD8A", "#FF9F5A"], gradientDark: ["#2A2410", "#0D1321"], accent: "#F2994A", heroText: "#3A2308" },
  "clear-night": { Icon: Moon, gradientLight: ["#A5B4FC", "#6366F1"], gradientDark: ["#141B31", "#0A0E1C"], accent: "#6366F1", heroText: "#1E1B4B" },
  "partly-cloudy": { Icon: CloudSun, gradientLight: ["#93C5FD", "#3B82F6"], gradientDark: ["#1A2236", "#0D1321"], accent: "#2F80ED", heroText: "#0F2A4D" },
  "partly-cloudy-night": { Icon: CloudMoon, gradientLight: ["#93C5FD", "#3B82F6"], gradientDark: ["#1A2236", "#0D1321"], accent: "#6366F1", heroText: "#0F2A4D" },
  cloudy: { Icon: Cloud, gradientLight: ["#B9C6D6", "#7C93AD"], gradientDark: ["#1B1F2B", "#0D1321"], accent: "#5B7590", heroText: "#1C2937" },
  drizzle: { Icon: CloudDrizzle, gradientLight: ["#7DD3FC", "#0EA5E9"], gradientDark: ["#101E2B", "#0A141F"], accent: "#0284C7", heroText: "#082F49" },
  rain: { Icon: CloudRain, gradientLight: ["#60A5FA", "#2563EB"], gradientDark: ["#0E1C2B", "#08121C"], accent: "#2563EB", heroText: "#0B1B3D" },
  storm: { Icon: CloudLightning, gradientLight: ["#C4B5FD", "#7C3AED"], gradientDark: ["#191533", "#0B0918"], accent: "#7C3AED", heroText: "#1E1240" },
  snow: { Icon: CloudSnow, gradientLight: ["#E0E7FF", "#A5B4FC"], gradientDark: ["#1B2233", "#0D1321"], accent: "#6366F1", heroText: "#1E1B4B" },
  fog: { Icon: CloudFog, gradientLight: ["#D1D9E0", "#9AAAB8"], gradientDark: ["#1C1D22", "#0D0E11"], accent: "#64748B", heroText: "#1E2937" },
};

export const ACTIVITIES = [
  { key: "Running", eval: (c) => (c.tempC <= 28 && c.precipChance < 30 ? "Good" : c.tempC <= 32 && c.precipChance < 50 ? "Fair" : "Poor") },
  { key: "Cycling", eval: (c) => (c.windKph < 20 && c.precipChance < 30 ? "Good" : c.windKph < 30 && c.precipChance < 55 ? "Fair" : "Poor") },
  { key: "Hiking", eval: (c) => (c.precipChance < 25 && c.uvIndex < 9 ? "Good" : c.precipChance < 50 ? "Fair" : "Poor") },
  { key: "Beach", eval: (c) => (c.tempC >= 27 && c.precipChance < 20 ? "Good" : c.tempC >= 24 && c.precipChance < 40 ? "Fair" : "Poor") },
  { key: "Photography", eval: (c) => (c.condition.includes("cloud") || c.condition === "clear-day" ? "Good" : c.precipChance < 40 ? "Fair" : "Poor") },
];

export function insightList(current) {
  const insights = [];
  if (current.humidity > 70 && current.feelsLikeC > current.tempC) {
    insights.push(`Feels ${current.feelsLikeC - current.tempC}° warmer because of humidity.`);
  }
  if (current.precipChance >= 25) insights.push(`Rain chance — ${current.precipChance}% avg today.`);
  else insights.push("Low chance of rain today.");
  if (current.uvIndex >= 7) insights.push("High UV — sunscreen recommended.");
  if (current.windKph >= 25) insights.push("Strong winds expected — secure loose items outdoors.");
  return insights;
}

export function buildBriefing(data, name) {
  const c = data.current;
  const rainNote = c.precipChance >= 20 ? ` with a ${c.precipChance}% average chance of rain` : "";
  const windNote = c.windKph >= 20 ? " Winds will be noticeably breezy." : " Winds stay light.";
  const uvNote = c.uvIndex >= 7 ? " UV runs high around midday, sunscreen recommended." : "";
  return `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} — ${name} sees a high near ${Math.round(c.highC)}° and a low near ${Math.round(c.lowC)}° today${rainNote}.${windNote}${uvNote}`;
}

export function outfitFor(current) {
  const items = [];
  if (current.tempC >= 28) items.push({ label: "Light, breathable clothing", icon: "🩳" });
  else if (current.tempC >= 20) items.push({ label: "T-shirt, light layers", icon: "👕" });
  else items.push({ label: "Jacket recommended", icon: "🧥" });
  if (current.precipChance >= 40) items.push({ label: "Bring an umbrella", icon: "☂️" });
  if (current.uvIndex >= 6) items.push({ label: "Sunglasses + sunscreen", icon: "🕶️" });
  if (current.windKph >= 22) items.push({ label: "Windbreaker helps", icon: "🌬️" });
  return items;
}
