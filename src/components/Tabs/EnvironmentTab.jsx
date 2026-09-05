import React, { useState } from "react";
import { Wind, Leaf, Info, AlertCircle, HelpCircle } from "lucide-react";
import { t } from "../../utils/i18n.js";

const AQI_RANGES = [
  { range: "0 – 50", label: "Good", color: "#10B981", desc: "Air quality is satisfactory and poses little or no health risk. Enjoy outdoor activities!" },
  { range: "51 – 100", label: "Moderate", color: "#F59E0B", desc: "Air quality is acceptable. Sensitive individuals with respiratory issues should limit prolonged outdoor exertion." },
  { range: "101 – 150", label: "Unhealthy (Sensitive)", color: "#F97316", desc: "Children, elderly, and people with asthma or lung conditions may experience irritation." },
  { range: "151+", label: "Unhealthy / Hazardous", color: "#EF4444", desc: "Everyone may begin to experience health effects. Limit outdoor activity or wear a protective mask." },
];

const POLLUTANT_INFO = [
  { key: "PM2.5", name: "Fine Particulate Matter", desc: "Microscopic dust/smoke particles (< 2.5 µm) from vehicle exhaust and fires that penetrate deep into the lungs and bloodstream." },
  { key: "PM10", name: "Coarse Dust Particles", desc: "Inhalable dust, pollen, and mold spores (< 10 µm) that irritate nasal passages and airways." },
  { key: "O₃", name: "Ground-Level Ozone", desc: "Smog gas created when sunlight reacts with vehicle emissions. Causes throat irritation and breathing difficulty." },
  { key: "NO₂", name: "Nitrogen Dioxide", desc: "Toxic emission gas primarily produced by automobiles and industrial power plants; aggravates respiratory symptoms." },
  { key: "CO", name: "Carbon Monoxide", desc: "Colorless gas produced by incomplete combustion in vehicle engines and industrial equipment." },
];

export default function EnvironmentTab({ data, dark, fs, lang, inkSoft, hairline, cardBg, cardShadow }) {
  const [showGuide, setShowGuide] = useState(true);
  const aqi = data.airQuality.aqi;
  const aqiColor = aqi <= 50 ? "#10B981" : aqi <= 100 ? "#F59E0B" : aqi <= 150 ? "#F97316" : "#EF4444";

  return (
    <div className="mt-5 space-y-4">
      {/* ---------------- AIR QUALITY INDEX DISPLAY ---------------- */}
      <section className="rounded-3xl border px-5 py-5 transition-colors" style={{ borderColor: hairline, background: cardBg, boxShadow: cardShadow }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold" style={{ fontSize: fs(14) }}>
            <Wind size={16} style={{ color: aqiColor }} /> {t("airQuality", lang)}
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: aqiColor }}>
            {data.airQuality.category}
          </span>
        </div>

        {/* Dynamic AQI Dial SVG */}
        <div className="relative flex flex-col items-center justify-center my-6">
          <svg viewBox="0 0 200 110" className="w-56 overflow-visible">
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" /> 
                <stop offset="33%" stopColor="#F59E0B" /> 
                <stop offset="66%" stopColor="#F97316" /> 
                <stop offset="100%" stopColor="#EF4444" /> 
              </linearGradient>
            </defs>
            {/* Background Track */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} strokeWidth="12" strokeLinecap="round" />
            
            {/* Active Colored Track */}
            {(() => {
              const maxAqi = 200; // Cap visual spread at 200
              const progress = Math.min(Math.max(aqi / maxAqi, 0), 1);
              const arcLength = Math.PI * 80;
              const offset = arcLength * (1 - progress);
              return (
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#aqiGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })()}
          </svg>
          <div className="absolute flex flex-col items-center mt-8">
            <span className="font-bold tracking-tight" style={{ fontSize: fs(34), color: aqiColor, lineHeight: 1 }}>{aqi}</span>
            <span className="font-semibold text-xs mt-1" style={{ color: inkSoft }}>AQI Score</span>
          </div>
        </div>

        {/* Dynamic Pollutant Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {[["PM2.5", data.airQuality.pm25, "µg/m³"], ["PM10", data.airQuality.pm10, "µg/m³"], ["O₃", data.airQuality.o3, "ppb"], ["NO₂", data.airQuality.no2, "ppb"], ["CO", data.airQuality.co, "ppm"]].map(([l, v, u]) => (
            <div key={l} className="rounded-2xl px-2.5 py-3 text-center transition-transform hover:-translate-y-0.5" style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: fs(11), color: inkSoft }} className="font-semibold">{l}</div>
              <div className="font-bold text-base mt-0.5">{v}</div>
              <div style={{ fontSize: fs(9.5), color: inkSoft }}>{u}</div>
            </div>
          ))}
        </div>

        {/* Toggle Guide Button */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:underline"
        >
          <HelpCircle size={14} />
          {showGuide ? "Hide Air Quality Guide & Meaning" : "What do these AQI numbers mean?"}
        </button>
      </section>

      {/* ---------------- EXPLANATORY GUIDE & MEANING OF AQI DATA ---------------- */}
      {showGuide && (
        <section className="space-y-3 rounded-3xl border px-5 py-5 transition-all" style={{ borderColor: hairline, background: dark ? "rgba(19,24,38,0.7)" : "#FFFFFF", boxShadow: cardShadow }}>
          <h3 className="flex items-center gap-2 font-semibold tracking-tight text-sm">
            <Info size={16} className="text-blue-500" /> What is Air Quality Index (AQI)?
          </h3>
          <p style={{ fontSize: fs(12), color: inkSoft, lineHeight: 1.6 }}>
            The <strong>Air Quality Index (AQI)</strong> is a standardized metric used to report how clean or polluted your local outdoor air is, and what associated health effects might concern you.
          </p>

          {/* AQI Scale Bar Guide */}
          <div className="mt-3 space-y-2">
            <div className="font-medium text-xs">AQI Category & Health Recommendations:</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AQI_RANGES.map((item) => (
                <div key={item.range} className="rounded-2xl border p-3" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs" style={{ color: item.color }}>{item.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full text-white" style={{ background: item.color }}>{item.range}</span>
                  </div>
                  <p className="mt-1 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pollutant Glossary */}
          <div className="mt-4 space-y-2">
            <div className="font-medium text-xs">Understanding Individual Pollutants:</div>
            <div className="space-y-2">
              {POLLUTANT_INFO.map((p) => (
                <div key={p.key} className="rounded-2xl border px-3 py-2.5 text-xs" style={{ borderColor: hairline }}>
                  <div className="font-semibold text-blue-400">{p.key} · {p.name}</div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- POLLEN SECTION ---------------- */}
      <section className="rounded-3xl border px-5 py-4" style={{ borderColor: hairline, background: cardBg, boxShadow: cardShadow }}>
        <span className="flex items-center gap-2 font-semibold" style={{ fontSize: fs(13) }}>
          <Leaf size={15} style={{ color: "#10B981" }} /> {t("pollen", lang)} · {data.pollen.overall}
        </span>
        <div className="mt-3 space-y-2">
          {[["Grass Pollen", data.pollen.grass], ["Tree Pollen", data.pollen.tree], ["Weed Pollen", data.pollen.weed]].map(([l, v]) => (
            <div key={l} className="flex items-center justify-between text-xs">
              <span style={{ color: inkSoft }}>{l}</span>
              <span className="font-semibold" style={{ color: v === "High" ? "#EF4444" : v === "Moderate" ? "#F59E0B" : "#10B981" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
