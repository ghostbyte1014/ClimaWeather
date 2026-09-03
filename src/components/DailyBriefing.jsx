import React from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { buildBriefing } from "../constants/conditionMeta.js";

export default function DailyBriefing({ data, briefingOpen, setBriefingOpen, meta, fs, inkSoft, hairline, cardBg, cardShadow }) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-3xl border transition-all duration-300 backdrop-blur-xl hover:shadow-lg"
      style={{
        borderColor: hairline,
        background: cardBg,
        boxShadow: cardShadow,
      }}
    >
      <button
        onClick={() => setBriefingOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 font-semibold tracking-tight" style={{ fontSize: fs(13.5) }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
            <Sparkles size={14} className="text-blue-500 animate-pulse" />
          </span>
          Today's outlook & Smart Summary
        </span>
        <ChevronDown
          size={16}
          style={{
            color: inkSoft,
            transform: briefingOpen ? "rotate(180deg)" : "none",
            transition: "transform .3s ease",
          }}
        />
      </button>

      {briefingOpen && (
        <div className="border-t px-5 py-3.5" style={{ borderColor: hairline }}>
          <p style={{ fontSize: fs(13), color: inkSoft, lineHeight: 1.6 }}>
            {buildBriefing(data, data.location.name)}
          </p>
        </div>
      )}
    </div>
  );
}
