import React from "react";
import { Sunrise, Sunset, Sun, Moon } from "lucide-react";

export default function SunArcWidget({ data, selectedDay, selectedDayIdx = 0, dark, fs, ink, inkSoft, hairline, cardBg, cardShadow }) {
  const current = data.current;
  const sunriseStr = selectedDay?.sunrise || current.sunrise || "5:45 AM";
  const sunsetStr = selectedDay?.sunset || current.sunset || "6:15 PM";

  // Compute progress along the sun arc (0 = Sunrise, 1 = Sunset)
  let progress = 0.5; // default noon
  let isSunUp = true;
  let statusText = "";

  // Get Target City's Local Time
  const utcOffsetSec = data.location?.utcOffsetSeconds ?? current.utcOffsetSeconds;
  const sysNow = new Date();
  let cityNow = sysNow;
  if (typeof utcOffsetSec === "number") {
    const utcMs = sysNow.getTime() + (sysNow.getTimezoneOffset() * 60000);
    cityNow = new Date(utcMs + (utcOffsetSec * 1000));
  }

  const srIso = selectedDay?.sunriseIso || current.sunriseIso;
  const ssIso = selectedDay?.sunsetIso || current.sunsetIso;

  // Extract hours & minutes in city local time
  let srMins = 5 * 60 + 45; // default 5:45 AM
  let ssMins = 18 * 60 + 15; // default 6:15 PM

  if (srIso && srIso.includes("T")) {
    const [h, m] = srIso.split("T")[1].split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) srMins = h * 60 + m;
  }
  if (ssIso && ssIso.includes("T")) {
    const [h, m] = ssIso.split("T")[1].split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) ssMins = h * 60 + m;
  }

  const nowMins = cityNow.getHours() * 60 + cityNow.getMinutes();

  if (selectedDayIdx > 0) {
    // For future forecast days, show clean full trajectory
    isSunUp = true;
    progress = 0.5;
    statusText = `${selectedDay?.day || "Forecast"} Daylight · ${sunriseStr} – ${sunsetStr}`;
  } else if (nowMins < srMins) {
    isSunUp = false;
    progress = 0;
    const diffMins = srMins - nowMins;
    const diffHours = Math.floor(diffMins / 60);
    statusText = `Night time · Dawn in ~${diffHours > 0 ? `${diffHours}h` : `${diffMins}m`}`;
  } else if (nowMins > ssMins) {
    isSunUp = false;
    progress = 1;
    statusText = "Night time · Sun has set";
  } else {
    isSunUp = true;
    const totalDaylightMins = ssMins - srMins;
    const elapsedMins = nowMins - srMins;
    progress = Math.min(Math.max(elapsedMins / totalDaylightMins, 0), 1);
    const leftMins = ssMins - nowMins;
    const leftHours = Math.floor(leftMins / 60);
    const remMins = leftMins % 60;
    statusText = `Sun is up · ${leftHours > 0 ? `${leftHours}h ${remMins}m` : `${remMins}m`} until sunset`;
  }

  // Calculate total daylight duration from ISO strings if available
  let totalDaylightMins = 750;
  if (srIso && ssIso && srIso.includes("T") && ssIso.includes("T")) {
    const [srH, srM] = srIso.split("T")[1].split(":").map(Number);
    const [ssH, ssM] = ssIso.split("T")[1].split(":").map(Number);
    if (!isNaN(srH) && !isNaN(ssH)) {
      totalDaylightMins = (ssH * 60 + ssM) - (srH * 60 + srM);
    }
  }
  const daylightHours = Math.floor(totalDaylightMins / 60);
  const daylightMins = totalDaylightMins % 60;

  // Stretched Arc Math (Wide 500x130 ViewBox)
  const cx = 250;
  const cy = 100;
  const rx = 210;
  const ry = 85;
  const angle = Math.PI * (1 - progress);
  const sunX = cx + rx * Math.cos(angle);
  const sunY = cy - ry * Math.sin(angle);

  // Approximate arc length calculation for dashoffset
  const approxArcLength = Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);

  const locName = data?.location?.name || "";

  return (
    <div
      className="mt-4 rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl"
      style={{
        borderColor: hairline,
        background: cardBg,
        boxShadow: cardShadow,
      }}
    >
      {/* Widget Title & Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10">
            {isSunUp ? <Sun size={16} className="text-amber-500 animate-spin-slow" /> : <Moon size={16} className="text-indigo-400" />}
          </div>
          <div>
            <h3 className="font-semibold tracking-tight" style={{ fontSize: fs(13.5) }}>
              Sun Trajectory & Daylight {locName ? `· ${locName}` : ""}
            </h3>
            <p style={{ fontSize: fs(11), color: inkSoft }}>
              {daylightHours}h {daylightMins}m total daylight today
            </p>
          </div>
        </div>

        <span className="rounded-full px-3 py-1 text-[11px] font-semibold border backdrop-blur-md" style={{ borderColor: hairline, color: isSunUp ? "#F59E0B" : "#818CF8", background: isSunUp ? "rgba(245,158,11,0.1)" : "rgba(129,140,248,0.1)" }}>
          {statusText}
        </span>
      </div>

      {/* Full-Width Stretched Sun Arc SVG Visualizer */}
      <div className="relative my-3 flex justify-center w-full px-2">
        <svg viewBox="0 0 500 130" className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="sunArcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
            </linearGradient>
            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dotted Horizon Line */}
          <line x1="20" y1="100" x2="480" y2="100" stroke={hairline} strokeWidth="1.5" strokeDasharray="5 5" />

          {/* Stretched Background Arc Track */}
          <path
            d="M 40 100 A 210 85 0 0 1 460 100"
            fill="none"
            stroke={dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Active Elapsed Arc Track */}
          {isSunUp && progress > 0 && (
            <path
              d="M 40 100 A 210 85 0 0 1 460 100"
              fill="none"
              stroke="url(#sunArcGradient)"
              strokeWidth="4"
              strokeDasharray={approxArcLength}
              strokeDashoffset={approxArcLength * (1 - progress)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Sun Orb Position */}
          {isSunUp ? (
            <g transform={`translate(${sunX}, ${sunY})`} filter="url(#sunGlow)">
              <circle r="10" fill="#F59E0B" />
              <circle r="16" fill="#F59E0B" opacity="0.3" className="animate-ping" />
            </g>
          ) : (
            <g transform={`translate(${sunX}, ${sunY})`}>
              <circle r="8" fill="#818CF8" />
            </g>
          )}

          {/* Sunrise Marker Text */}
          <text x="40" y="118" textAnchor="middle" fill={inkSoft} fontSize="11" fontWeight="600">
            {sunriseStr}
          </text>

          {/* Solar Noon Marker */}
          <text x="250" y="14" textAnchor="middle" fill={inkSoft} fontSize="10" opacity="0.7">
            Solar Noon
          </text>

          {/* Sunset Marker Text */}
          <text x="460" y="118" textAnchor="middle" fill={inkSoft} fontSize="11" fontWeight="600">
            {sunsetStr}
          </text>
        </svg>
      </div>

      {/* Sunrise & Sunset Footer Details */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: hairline }}>
        <div className="flex items-center gap-2.5 rounded-2xl p-2.5" style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Sunrise size={18} />
          </div>
          <div>
            <div style={{ fontSize: fs(10.5), color: inkSoft }}>Sunrise</div>
            <div className="font-semibold" style={{ fontSize: fs(13) }}>{sunriseStr}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl p-2.5" style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <Sunset size={18} />
          </div>
          <div>
            <div style={{ fontSize: fs(10.5), color: inkSoft }}>Sunset</div>
            <div className="font-semibold" style={{ fontSize: fs(13) }}>{sunsetStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
