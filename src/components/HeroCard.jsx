import React from "react";
import { MapPin, Sparkles } from "lucide-react";
import ConditionIcon from "./ConditionIcon.jsx";
import { insightList, outfitFor } from "../constants/conditionMeta.js";

export default function HeroCard({ data, dark, meta, fs, temp, saved, onToggleSave, reducedMotion }) {
  const [g1, g2] = dark ? meta.gradientDark : meta.gradientLight;
  const outfitItems = outfitFor(data.current);

  // Temperature status badge helper
  const tC = data.current.tempC;
  const tempStatus =
    tC >= 35 ? { label: "Extreme Heat Alert", bg: "bg-red-500/20 text-red-300 border-red-500/40" }
    : tC >= 30 ? { label: "Warm & Tropical", bg: "bg-amber-500/20 text-amber-300 border-amber-500/40" }
    : tC >= 22 ? { label: "Pleasant & Comfortable", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" }
    : { label: "Cool & Crisp", bg: "bg-blue-500/20 text-blue-300 border-blue-500/40" };

  return (
    <div
      className="group relative overflow-hidden rounded-[32px] px-6 pt-7 pb-6 transition-all duration-500 border border-white/20 backdrop-blur-xl shadow-2xl"
      style={{
        background: `linear-gradient(160deg, ${g1}, ${g2})`,
        boxShadow: dark
          ? `0 12px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`
          : `0 16px 40px ${meta.accent}35, inset 0 1px 0 rgba(255,255,255,0.5)`,
      }}
    >
      {/* Dynamic Stale/Cached Tag */}
      {data.__stale && (
        <div className="absolute right-4 top-4 rounded-full px-2.5 py-0.5 backdrop-blur-md bg-black/20 text-[10px] font-mono tracking-wider" style={{ color: dark ? "#F5F7FA" : meta.heroText }}>
          cached
        </div>
      )}

      {/* Header: Location & Save Bookmark */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-medium tracking-tight" style={{ color: dark ? "#F5F7FA" : meta.heroText, opacity: 0.85, fontSize: fs(13.5) }}>
            <MapPin size={14} className="animate-pulse" style={{ color: meta.accent }} />
            <span>{data.location.name}</span>
          </div>
          <div style={{ color: dark ? "#F5F7FA" : meta.heroText, opacity: 0.6, fontSize: fs(12) }}>
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

        <button
          onClick={() => onToggleSave(data.location)}
          aria-label="Save location"
          className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)" }}
        >
          <span style={{ color: saved.includes(data.location.name) ? "#F59E0B" : dark ? "#F5F7FA" : meta.heroText, fontSize: fs(18) }}>
            {saved.includes(data.location.name) ? "★" : "☆"}
          </span>
        </button>
      </div>

      {/* Hero Temperature & Animated Condition Icon */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="leading-none"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: fs(80),
                fontWeight: 400,
                color: dark ? "#F5F7FA" : meta.heroText,
                letterSpacing: "-0.03em",
              }}
            >
              {temp(data.current.tempC)}°
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="font-semibold tracking-tight" style={{ color: dark ? "#F5F7FA" : meta.heroText, opacity: 0.9, fontSize: fs(16) }}>
              {data.current.conditionLabel}
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold backdrop-blur-md ${tempStatus.bg}`}>
              {tempStatus.label}
            </span>
          </div>

          <div className="mt-1" style={{ color: dark ? "#F5F7FA" : meta.heroText, opacity: 0.65, fontSize: fs(12.5) }}>
            Feels like {temp(data.current.feelsLikeC)}°  ·  H {temp(data.current.highC)}°  ·  L {temp(data.current.lowC)}°
          </div>
        </div>

        {/* Condition Icon with gentle float animation */}
        <div className="transition-transform duration-500 hover:scale-110">
          <ConditionIcon
            condition={data.current.condition}
            size={76}
            className="opacity-95 drop-shadow-lg"
            spin={data.current.condition === "clear-day" && !reducedMotion}
          />
        </div>
      </div>

      {/* Weather Insights Pills */}
      <div className="mt-4 space-y-1.5">
        {insightList(data.current).slice(0, 2).map((line, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2 backdrop-blur-md border transition-all"
            style={{
              borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)",
              background: dark ? "rgba(11,15,26,0.25)" : "rgba(255,255,255,0.45)",
            }}
          >
            <Sparkles size={13} style={{ color: meta.accent }} className="shrink-0" />
            <span style={{ fontSize: fs(12.5), color: dark ? "#F5F7FA" : meta.heroText }} className="font-medium">
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* Outfit & Gear Recommendation Chips */}
      {outfitItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {outfitItems.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md border transition-transform hover:scale-105"
              style={{
                borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)",
                color: dark ? "#EDEFF5" : meta.heroText,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
