import React from "react";
import { Sunrise, Sunset, Sun, Moon } from "lucide-react";

export default function SunArcWidget({ data, selectedDay, selectedDayIdx = 0, dark, fs, ink, inkSoft, hairline, cardBg, cardShadow }) {
  const current = data.current;
  const sunriseStr = selectedDay?.sunrise || current.sunrise || "5:45 AM";
  const sunsetStr = selectedDay?.sunset || current.sunset || "6:15 PM";

  // Compute progress along the arc (0 = Start, 1 = End)
  let progress = 0.5; // default noon/midnight
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

  let leftLabel = sunriseStr;
  let rightLabel = sunsetStr;
  let totalMinsForTitle = 0;
  
  if (selectedDayIdx > 0) {
    // For future forecast days, show clean full trajectory for sun
    isSunUp = true;
    progress = 0.5;
    leftLabel = sunriseStr;
    rightLabel = sunsetStr;
    statusText = `${selectedDay?.day || "Forecast"} Daylight · ${sunriseStr} – ${sunsetStr}`;
    totalMinsForTitle = ssMins > srMins ? (ssMins - srMins) : 750;
  } else if (nowMins < srMins || nowMins > ssMins) {
    // Nighttime! Moon Arc
    isSunUp = false;
    leftLabel = sunsetStr;
    rightLabel = sunriseStr;
    
    // Total night minutes is from sunset to sunrise
    const totalNightMins = (24 * 60 - ssMins) + srMins;
    let elapsedNight = 0;
    
    if (nowMins < srMins) {
      // After midnight, before sunrise
      elapsedNight = (24 * 60 - ssMins) + nowMins;
      const leftMins = srMins - nowMins;
      const leftHours = Math.floor(leftMins / 60);
      const remMins = leftMins % 60;
      statusText = `Night time · Dawn in ${leftHours > 0 ? `${leftHours}h ${remMins}m` : `${remMins}m`}`;
    } else {
      // After sunset, before midnight
      elapsedNight = nowMins - ssMins;
      const leftMins = totalNightMins - elapsedNight;
      const leftHours = Math.floor(leftMins / 60);
      const remMins = leftMins % 60;
      statusText = `Night time · Dawn in ${leftHours > 0 ? `${leftHours}h ${remMins}m` : `${remMins}m`}`;
    }
    progress = Math.min(Math.max(elapsedNight / totalNightMins, 0), 1);
    totalMinsForTitle = totalNightMins;
  } else {
    // Daytime! Sun Arc
    isSunUp = true;
    leftLabel = sunriseStr;
    rightLabel = sunsetStr;
    
    const totalDaylightMins = ssMins - srMins;
    const elapsedMins = nowMins - srMins;
    progress = Math.min(Math.max(elapsedMins / totalDaylightMins, 0), 1);
    
    const leftMins = ssMins - nowMins;
    const leftHours = Math.floor(leftMins / 60);
    const remMins = leftMins % 60;
    statusText = `Sun is up · ${leftHours > 0 ? `${leftHours}h ${remMins}m` : `${remMins}m`} until sunset`;
    totalMinsForTitle = totalDaylightMins;
  }

  const cycleHours = Math.floor(totalMinsForTitle / 60);
  const cycleMins = totalMinsForTitle % 60;

  // Stretched Arc Math (Wide 500x130 ViewBox)
  const cx = 250;
  const cy = 100;
  const rx = 210;
  const ry = 85;
  const angle = Math.PI * (1 - progress);
  const orbX = cx + rx * Math.cos(angle);
  const orbY = cy - ry * Math.sin(angle);

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
          <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${isSunUp ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}>
            {isSunUp ? <Sun size={16} className="text-amber-500 animate-spin-slow" /> : <Moon size={16} className="text-indigo-400" />}
          </div>
          <div>
            <h3 className="font-semibold tracking-tight" style={{ fontSize: fs(13.5) }}>
              {isSunUp ? "Sun Trajectory" : "Moon Trajectory"} {locName ? `· ${locName}` : ""}
            </h3>
            <p style={{ fontSize: fs(11), color: inkSoft }}>
              {cycleHours}h {cycleMins}m total {isSunUp ? "daylight" : "nighttime"}
            </p>
          </div>
        </div>

        <span className="rounded-full px-3 py-1 text-[11px] font-semibold border backdrop-blur-md" style={{ borderColor: hairline, color: isSunUp ? "#F59E0B" : "#818CF8", background: isSunUp ? "rgba(245,158,11,0.1)" : "rgba(129,140,248,0.1)" }}>
          {statusText}
        </span>
      </div>

      {/* Full-Width Stretched Arc SVG Visualizer */}
      <div className="relative my-3 flex justify-center w-full px-2">
        <svg viewBox="0 0 500 130" className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="sunArcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="moonArcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
            <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
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
          {progress > 0 && (
            <path
              d="M 40 100 A 210 85 0 0 1 460 100"
              fill="none"
              stroke={isSunUp ? "url(#sunArcGradient)" : "url(#moonArcGradient)"}
              strokeWidth="4"
              strokeDasharray={approxArcLength}
              strokeDashoffset={approxArcLength * (1 - progress)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Orb Position (Sun or Moon) */}
          <g transform={`translate(${orbX}, ${orbY})`} filter="url(#orbGlow)">
            <circle r="10" fill={isSunUp ? "#F59E0B" : "#818CF8"} />
            <circle r="16" fill={isSunUp ? "#F59E0B" : "#818CF8"} opacity="0.3" className="animate-ping" />
          </g>

          {/* Left Marker Text */}
          <text x="40" y="118" textAnchor="middle" fill={inkSoft} fontSize="11" fontWeight="600">
            {leftLabel}
          </text>

          {/* Zenith Marker */}
          <text x="250" y="14" textAnchor="middle" fill={inkSoft} fontSize="10" opacity="0.7">
            {isSunUp ? "Solar Noon" : "Midnight"}
          </text>

          {/* Right Marker Text */}
          <text x="460" y="118" textAnchor="middle" fill={inkSoft} fontSize="11" fontWeight="600">
            {rightLabel}
          </text>
        </svg>
      </div>

      {/* Dynamic Event Footer Details */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: hairline }}>
        {/* Left Block (Sunrise if Day, Sunset if Night) */}
        <div className="flex items-center gap-2.5 rounded-2xl p-2.5" style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isSunUp ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {isSunUp ? <Sunrise size={18} /> : <Sunset size={18} />}
          </div>
          <div>
            <div style={{ fontSize: fs(10.5), color: inkSoft }}>{isSunUp ? "Sunrise" : "Sunset"}</div>
            <div className="font-semibold" style={{ fontSize: fs(13) }}>{isSunUp ? sunriseStr : sunsetStr}</div>
          </div>
        </div>

        {/* Right Block (Sunset if Day, Sunrise if Night) */}
        <div className="flex items-center gap-2.5 rounded-2xl p-2.5" style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isSunUp ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {isSunUp ? <Sunset size={18} /> : <Sunrise size={18} />}
          </div>
          <div>
            <div style={{ fontSize: fs(10.5), color: inkSoft }}>{isSunUp ? "Sunset" : "Sunrise"}</div>
            <div className="font-semibold" style={{ fontSize: fs(13) }}>{isSunUp ? sunsetStr : sunriseStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
