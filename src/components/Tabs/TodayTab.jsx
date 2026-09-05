import React, { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import ConditionIcon from "../ConditionIcon.jsx";
import SunArcWidget from "../SunArcWidget.jsx";

const SUB_METRIC_PILLS = [
  "Overview", "Precipitation", "Wind", "Humidity",
  "Cloud cover", "Pressure", "UV", "Feels like (Heat Index)"
];

export default function TodayTab({ data, selectedDayIdx = 0, setSelectedDayIdx, dark, meta, fs, temp, ink, inkSoft, hairline, cardBg, cardShadow }) {
  const [activeMetricPill, setActiveMetricPill] = useState("Overview");
  const [showFeelsLike, setShowFeelsLike] = useState(true);
  const activeHourRef = useRef(null);

  useEffect(() => {
    if (activeHourRef.current) {
      activeHourRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedDayIdx]);

  const selectedDay = data.daily[selectedDayIdx] || data.daily[0];
  const hourlyData = selectedDay?.hourly || data.hourly;

  // Dynamically map chart dataset based on active pill
  const chartData = hourlyData.map((h) => ({
    time: h.time,
    temp: temp(h.tempC),
    feelsLike: temp(h.feelsLikeC),
    precip: h.precipChance,
    precipMm: h.precipMm,
    wind: h.windKph,
    humidity: h.humidity,
    uv: h.uvIndex,
    pressure: h.pressureHpa,
    cloudCover: h.cloudCover,
  }));

  // Determine active metric properties for rendering
  function getMetricConfig() {
    switch (activeMetricPill) {
      case "Precipitation":
        return { key: "precip", unit: "%", color: "#0284C7", label: "Precipitation Chance (%) & Volume (mm)" };
      case "Wind":
        return { key: "wind", unit: " km/h", color: "#0D9488", label: "Wind Speed" };
      case "Humidity":
        return { key: "humidity", unit: "%", color: "#2563EB", label: "Relative Humidity" };
      case "Cloud cover":
        return { key: "cloudCover", unit: "%", color: "#64748B", label: "Cloud Cover" };
      case "Pressure":
        return { key: "pressure", unit: " hPa", color: "#7C3AED", label: "Pressure" };
      case "UV":
        return { key: "uv", unit: " UV", color: "#F2994A", label: "UV Index" };
      case "Feels like (Heat Index)":
        return { key: "feelsLike", unit: "°", color: "#EF4444", label: "Heat Index (Feels Like)" };
      default: // Overview
        return { key: "temp", unit: "°", color: meta.accent, label: "Actual Temperature" };
    }
  }

  const metricConfig = getMetricConfig();

  return (
    <div className="mt-4 space-y-5">
      {/* ---------------- SUB-METRIC PILLS ROW ---------------- */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {SUB_METRIC_PILLS.map((pill) => {
          const isActive = activeMetricPill === pill;
          return (
            <button
              key={pill}
              onClick={() => {
                setActiveMetricPill(pill);
                if (pill === "Feels like (Heat Index)") setShowFeelsLike(true);
              }}
              className="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all duration-300"
              style={{
                borderColor: isActive ? meta.accent : hairline,
                background: isActive ? meta.accent + "33" : dark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                color: isActive ? (dark ? "#FFFFFF" : meta.heroText) : inkSoft,
                fontWeight: isActive ? 600 : 400,
                transform: isActive ? "scale(1.03)" : "scale(1)",
              }}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* ---------------- DAY SELECTOR CARDS CAROUSEL ---------------- */}
      <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-4 -mx-4" style={{ scrollbarWidth: "none" }}>
        {data.daily.map((d, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className="flex min-w-[90px] flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 transition-all duration-300 text-left"
              style={{
                borderColor: isSelected ? meta.accent : hairline,
                background: isSelected
                  ? `linear-gradient(145deg, ${meta.accent}30, ${dark ? "#131826" : "#FFFFFF"})`
                  : dark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                boxShadow: isSelected ? `0 4px 16px ${meta.accent}26` : cardShadow,
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div className="flex w-full items-center justify-between font-medium" style={{ fontSize: fs(11), color: isSelected ? ink : inkSoft }}>
                <span>{d.dayNum}</span>
                <span>{d.day}</span>
              </div>
              <ConditionIcon condition={d.condition} size={22} />
              <div className="mt-1 flex items-baseline gap-1" style={{ fontSize: fs(13) }}>
                <span className="font-semibold" style={{ color: ink }}>{temp(d.hiC)}°</span>
                <span style={{ fontSize: fs(11), color: inkSoft }}>{temp(d.loC)}°</span>
              </div>
              <div style={{ fontSize: fs(9.5), color: meta.accent }} className="font-medium">
                Feels {temp(d.heatIndexHiC)}°
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------------- HOURLY OVERVIEW CHART CARD ---------------- */}
      <div className="rounded-3xl border p-4 transition-all duration-500" style={{ borderColor: hairline, background: cardBg, boxShadow: cardShadow }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold tracking-tight" style={{ fontSize: fs(14) }}>
              {metricConfig.label} · {selectedDay.day} ({selectedDay.date})
            </h3>
            <p style={{ fontSize: fs(11), color: inkSoft }}>
              Max Heat Index: <strong style={{ color: meta.accent }}>{temp(selectedDay.heatIndexHiC)}°</strong>
            </p>
          </div>

          {activeMetricPill === "Overview" && (
            <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: inkSoft }}>
              <span>Heat Index</span>
              <input
                type="checkbox"
                checked={showFeelsLike}
                onChange={(e) => setShowFeelsLike(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          )}
        </div>

        {/* Dynamic Interactive Recharts Engine */}
        <div className="mt-2 w-full">
          <ResponsiveContainer width="100%" height={160}>
            {activeMetricPill === "Precipitation" ? (
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={hairline} vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: inkSoft }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: inkSoft }} axisLine={false} tickLine={false} width={35} unit="%" />
                <Tooltip
                  contentStyle={{ background: dark ? "#131826" : "#FFFFFF", border: `1px solid ${hairline}`, borderRadius: 12, fontSize: 12, color: ink }}
                  formatter={(v, name, item) => {
                    const mm = item.payload.precipMm;
                    const intensity = mm >= 7.6 ? "Heavy Rain" : mm >= 2.5 ? "Moderate Rain" : mm >= 0.1 ? "Light Drizzle" : "No Rain";
                    return [
                      `${v}% chance · ${mm} mm/h (${intensity})`,
                      "Precipitation"
                    ];
                  }}
                />
                <Bar dataKey="precip" fill={metricConfig.color} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={400} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metricConfig.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={metricConfig.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={hairline} vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: inkSoft }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: inkSoft }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: dark ? "#131826" : "#FFFFFF",
                    border: `1px solid ${hairline}`,
                    borderRadius: 12,
                    fontSize: 12,
                    color: ink,
                  }}
                  formatter={(v, name) => [
                    `${v}${metricConfig.unit}`,
                    name === "feelsLike" ? "Heat Index (Feels Like)" : name === "temp" ? "Actual Temperature" : metricConfig.label
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={metricConfig.key}
                  name={metricConfig.key}
                  stroke={metricConfig.color}
                  strokeWidth={2.5}
                  fill="url(#metricGradient)"
                  isAnimationActive={true}
                  animationDuration={400}
                />
                {activeMetricPill === "Overview" && showFeelsLike && (
                  <Area
                    type="monotone"
                    dataKey="feelsLike"
                    name="feelsLike"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#feelsGradient)"
                    isAnimationActive={true}
                    animationDuration={400}
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: inkSoft }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: metricConfig.color }} /> {metricConfig.label}
            </span>
            {activeMetricPill === "Overview" && showFeelsLike && (
              <span className="flex items-center gap-1 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Heat Index (Feels Like)
              </span>
            )}
          </div>
          <span>
            Rain: {selectedDay.precipChance}% chance {selectedDay.precipSumMm > 0 ? `(${selectedDay.precipSumMm} mm total)` : ""}
          </span>
        </div>
      </div>

      {/* ---------------- 24-HOUR ITEM CAROUSEL FOR SELECTED DAY ---------------- */}
      <section>
        <h3 className="mb-2 font-semibold tracking-tight" style={{ fontSize: fs(13) }}>
          Hourly Breakdown for {selectedDay.day}
        </h3>
        <div className="flex gap-1.5 overflow-x-auto pb-4 pt-1 px-4 -mx-4" style={{ scrollbarWidth: "none" }}>
          {hourlyData.map((h, i) => {
            const isCurrentHour = selectedDayIdx === 0 && (h.time === "Now" || h.hour24 === new Date().getHours());
            return (
            <div
              key={i}
              ref={isCurrentHour ? activeHourRef : null}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-transform ${isCurrentHour ? '' : 'hover:-translate-y-0.5'}`}
              style={{
                borderColor: isCurrentHour ? meta.accent : hairline,
                background: isCurrentHour ? meta.accent + "22" : cardBg,
                boxShadow: isCurrentHour ? `0 4px 12px ${meta.accent}26` : 'none',
                transform: isCurrentHour ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: fs(10.5), color: isCurrentHour ? meta.accent : inkSoft }} className={isCurrentHour ? 'font-bold' : ''}>{h.time}</span>
              <ConditionIcon condition={h.condition} size={20} />
              <span className="font-semibold" style={{ fontSize: fs(13), color: ink }}>
                {activeMetricPill === "Precipitation"
                  ? `${h.precipChance}%`
                  : activeMetricPill === "Wind"
                  ? `${h.windKph}kph`
                  : activeMetricPill === "Humidity"
                  ? `${h.humidity}%`
                  : activeMetricPill === "Cloud cover"
                  ? `${h.cloudCover}%`
                  : activeMetricPill === "UV"
                  ? `${h.uvIndex} UV`
                  : `${temp(h.tempC)}°`}
              </span>
              <span style={{ fontSize: fs(9.5), color: h.precipMm > 0 ? "#0284C7" : (isCurrentHour ? meta.accent : "#EF4444") }}>
                {activeMetricPill === "Precipitation" ? `${h.precipMm} mm` : `Feels ${temp(h.feelsLikeC)}°`}
              </span>
            </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- SUNRISE & SUNSET TRAJECTORY ARC WIDGET ---------------- */}
      <SunArcWidget data={data} selectedDay={selectedDay} selectedDayIdx={selectedDayIdx} dark={dark} fs={fs} ink={ink} inkSoft={inkSoft} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} />
    </div>
  );
}
