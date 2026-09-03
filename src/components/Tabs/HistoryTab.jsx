import React from "react";

export default function HistoryTab({ data, temp, fs, inkSoft, hairline }) {
  return (
    <div className="mt-5 space-y-3">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: hairline }}>
        <div className="flex items-center justify-between px-4 py-3">
          <span style={{ fontSize: fs(13) }}>Yesterday</span>
          <span style={{ fontSize: fs(13) }}>
            {temp(data.history.yesterday.hiC)}° <span style={{ color: inkSoft }}>/ {temp(data.history.yesterday.loC)}°</span>
          </span>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: hairline }}>
          <span style={{ fontSize: fs(13) }}>Today</span>
          <span style={{ fontSize: fs(13) }}>
            {temp(data.current.highC)}° <span style={{ color: inkSoft }}>/ {temp(data.current.lowC)}°</span>
          </span>
        </div>
      </div>
    </div>
  );
}
