import React from "react";
import { X, Info, Sun, Droplets, Wind, Gauge, Eye, Thermometer, ShieldAlert, Sparkles } from "lucide-react";

export const WEATHER_GLOSSARY = [
  {
    key: "heatIndex",
    title: "Heat Index (Feels Like)",
    icon: Thermometer,
    color: "#EF4444",
    simple: "How hot the weather actually feels to your body.",
    detail: "When relative humidity is high, sweat cannot evaporate efficiently from your skin to cool you down. This makes the air feel significantly hotter than the thermometer reading, increasing the risk of heat exhaustion.",
  },
  {
    key: "uvIndex",
    title: "UV Index (Sun Radiation)",
    icon: Sun,
    color: "#F2994A",
    simple: "Strength of sunburn-producing solar radiation.",
    detail: "0–2 is Low (safe). 3–5 is Moderate. 6–7 is High (sunscreen & sunglasses recommended). 8–10 is Very High, and 11+ is Extreme (unprotected skin can burn in under 10 minutes around noon).",
  },
  {
    key: "humidity",
    title: "Relative Humidity (%)",
    icon: Droplets,
    color: "#2563EB",
    simple: "Amount of moisture floating in the air.",
    detail: "Expressed as a percentage of maximum water vapor the air can hold. High humidity (> 70%) makes tropical heat feel sticky and muggy. Low humidity (< 30%) causes dry skin and chapped lips.",
  },
  {
    key: "pressure",
    title: "Barometric Pressure (hPa)",
    icon: Gauge,
    color: "#7C3AED",
    simple: "Weight of atmospheric air pressing down on Earth.",
    detail: "High pressure (above 1013 hPa) brings stable, calm, sunny weather. Falling low pressure (below 1005 hPa) signals approaching rain clouds, stormy weather, or typhoons.",
  },
  {
    key: "visibility",
    title: "Visibility (km)",
    icon: Eye,
    color: "#64748B",
    simple: "Maximum distance you can see clearly.",
    detail: "Normal clear visibility is 10 km or more. Visibility below 5 km happens during heavy rain showers, dense fog, or thick smog, requiring extra care when driving.",
  },
  {
    key: "wind",
    title: "Wind Speed & Direction",
    icon: Wind,
    color: "#0D9488",
    simple: "Speed of moving air and where it is coming from.",
    detail: "Wind direction (e.g. NE = North-East, SW = South-West monsoon) shows the origin of moving air masses. Light breeze is < 15 km/h, while strong winds > 30 km/h can sway trees and affect outdoor plans.",
  },
  {
    key: "aqi",
    title: "Air Quality Index (AQI)",
    icon: ShieldAlert,
    color: "#10B981",
    simple: "Overall cleanliness and safety rating of outdoor air.",
    detail: "Scores from 0 to 500 measuring 5 major pollutants (PM2.5, PM10, Ozone, NO₂, CO). 0–50 is Good, 51–100 is Moderate, and 101+ indicates unhealthy air for sensitive individuals.",
  },
];

export default function WeatherGuideModal({ isOpen, onClose, selectedKey, dark, ink, inkSoft, hairline, fs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-2xl transition-all"
        style={{ background: dark ? "#131826" : "#FFFFFF", color: ink }}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: hairline }}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <h2 className="font-semibold" style={{ fontSize: fs(16) }}>Weather Terms Guide for Beginners</h2>
          </div>
          <button onClick={onClose} aria-label="Close guide"><X size={18} style={{ color: inkSoft }} /></button>
        </div>

        <p className="mb-4 text-xs" style={{ color: inkSoft, lineHeight: 1.5 }}>
          Weather forecasts use technical terms. Here is a simple, plain-English explanation for every measurement:
        </p>

        <div className="space-y-3">
          {WEATHER_GLOSSARY.map((item) => {
            const Icon = item.icon;
            const isHighlighted = selectedKey === item.key;
            return (
              <div
                key={item.key}
                className="rounded-2xl border p-4 transition-all"
                style={{
                  borderColor: isHighlighted ? item.color : hairline,
                  background: isHighlighted ? item.color + "15" : dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center gap-2 font-semibold" style={{ fontSize: fs(13.5), color: item.color }}>
                  <Icon size={16} />
                  <span>{item.title}</span>
                </div>
                <div className="mt-1 font-medium text-xs text-slate-200 dark:text-slate-200">
                  {item.simple}
                </div>
                <p className="mt-1.5 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.5 }}>
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Got it! Close Guide
        </button>
      </div>
    </div>
  );
}
