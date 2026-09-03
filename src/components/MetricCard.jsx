import React from "react";
import { Info } from "lucide-react";

export default function MetricCard({ icon: Icon, label, value, sub, dark, fs, chip, onInfoClick }) {
  return (
    <div
      onClick={onInfoClick}
      className="group relative flex items-start gap-3 rounded-2xl px-4 py-3.5 border transition-all hover:-translate-y-0.5 cursor-pointer select-none"
      style={{
        borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(16,24,40,0.08)",
        background: dark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
        boxShadow: dark ? "none" : "0 2px 10px rgba(16,24,40,0.05)",
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: chip + (dark ? "26" : "1A") }}>
        <Icon size={16} style={{ color: chip }} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center justify-between">
          <div style={{ fontSize: fs(11), color: dark ? "#9AA3B8" : "#7A8AA0" }} className="tracking-wide">{label}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onInfoClick?.(); }}
            className="opacity-40 hover:opacity-100 transition-opacity"
            title="Explain this measurement"
          >
            <Info size={13} style={{ color: chip }} />
          </button>
        </div>
        <div style={{ fontSize: fs(15), color: dark ? "#EDEFF5" : "#101828" }} className="font-semibold">{value}</div>
        {sub && <div style={{ fontSize: fs(11), color: dark ? "#6B7688" : "#98A5B8" }}>{sub}</div>}
      </div>
    </div>
  );
}
