import React from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_CITIES } from "../../constants/conditionMeta.js";

export default function CompareTab({
  activeCity, data, compareCityName, setCompareCityName, compareData, temp, fs, ink, inkSoft, hairline, cardBg, cardShadow
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <span style={{ fontSize: fs(12.5), color: inkSoft }}>Compare with</span>
        <select
          value={compareCityName}
          onChange={(e) => setCompareCityName(e.target.value)}
          className="rounded-full border px-3 py-1.5"
          style={{ borderColor: hairline, background: "transparent", color: ink, fontSize: fs(12.5) }}
        >
          {DEFAULT_CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[{ label: activeCity.name, d: data }, { label: compareCityName, d: compareData }].map((col, i) => (
          <div key={i} className="rounded-2xl border px-4 py-3.5" style={{ borderColor: hairline, background: cardBg, boxShadow: cardShadow }}>
            <div className="font-medium" style={{ fontSize: fs(13) }}>{col.label}</div>
            {col.d ? (
              <>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: fs(34) }}>{temp(col.d.current.tempC)}°</div>
                <div style={{ fontSize: fs(12), color: inkSoft }}>{col.d.current.conditionLabel}</div>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-1.5" style={{ fontSize: fs(12), color: inkSoft }}>
                <Loader2 size={12} className="animate-spin" /> Loading…
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
