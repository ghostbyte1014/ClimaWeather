import React from "react";
import { Sun, Share2, Bell, RefreshCw, Settings } from "lucide-react";
import { t } from "../utils/i18n.js";

export default function Header({
  lang, fs, meta, dark, inkSoft, refreshing, loading, notifPermission,
  onShare, onRequestNotif, onRefresh, onOpenSettings
}) {
  return (
    <header className="flex items-center justify-between pt-6 pb-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: meta.accent + "26" }}>
          <Sun size={16} style={{ color: meta.accent }} strokeWidth={2} />
        </div>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: fs(15) }} className="font-semibold tracking-tight">
          {t("appTitle", lang)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onShare} aria-label="Share weather" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#EEF2F8" }}>
          <Share2 size={14} style={{ color: inkSoft }} />
        </button>
        <button onClick={onRequestNotif} aria-label="Enable notifications" className="relative flex h-8 w-8 items-center justify-center rounded-full" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#EEF2F8" }}>
          <Bell size={14} style={{ color: notifPermission === "granted" ? meta.accent : inkSoft }} />
        </button>
        <button onClick={onRefresh} aria-label="Refresh weather" disabled={refreshing || loading} className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-50" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#EEF2F8" }}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} style={{ color: inkSoft }} />
        </button>
        <button onClick={onOpenSettings} aria-label="Open settings" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#EEF2F8" }}>
          <Settings size={14} style={{ color: inkSoft }} />
        </button>
      </div>
    </header>
  );
}
