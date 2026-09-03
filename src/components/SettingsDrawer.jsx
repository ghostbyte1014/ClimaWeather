import React from "react";
import { X, Globe, Contrast, Type, PlayCircle, Download } from "lucide-react";
import { t } from "../utils/i18n.js";

export default function SettingsDrawer({
  settingsOpen, setSettingsOpen, lang, setLang, themeMode, setThemeMode,
  accessibility, setAccessibility, installEvent, installApp, saveSetting,
  dark, ink, inkSoft, hairline, fs, meta
}) {
  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSettingsOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl px-5 py-5" style={{ background: dark ? "#131826" : "#FFFFFF", color: ink }}>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold" style={{ fontSize: fs(15) }}>{t("settings", lang)}</span>
          <button onClick={() => setSettingsOpen(false)}><X size={16} style={{ color: inkSoft }} /></button>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 font-medium" style={{ fontSize: fs(12.5), color: inkSoft }}><Globe size={13} /> Language / Wika</div>
          <div className="flex flex-wrap gap-2">
            {[["en", "English"], ["tl", "Tagalog"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"]].map(([code, label]) => (
              <button key={code} onClick={() => { setLang(code); saveSetting("lang", code); }} className="rounded-xl border px-3 py-1.5 text-xs font-medium" style={{ borderColor: hairline, background: lang === code ? meta.accent + "33" : "transparent" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 font-medium" style={{ fontSize: fs(12.5), color: inkSoft }}>{t("theme", lang)}</div>
          <div className="flex gap-2">
            {["light", "dark", "auto"].map((m) => (
              <button key={m} onClick={() => { setThemeMode(m); saveSetting("themeMode", m); }} className="flex-1 rounded-xl border py-2 capitalize" style={{ borderColor: hairline, background: themeMode === m ? meta.accent + "26" : "transparent", fontSize: fs(12.5) }}>{m}</button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 font-medium" style={{ fontSize: fs(12.5), color: inkSoft }}><Contrast size={13} /> {t("accessibility", lang)}</div>
          <div className="space-y-2">
            {[
              ["largeText", "Larger text", Type],
              ["reducedMotion", "Reduce motion", PlayCircle],
              ["highContrast", "High contrast", Contrast],
            ].map(([key, label, Icon]) => (
              <label key={key} className="flex items-center justify-between rounded-xl border px-3 py-2.5" style={{ borderColor: hairline }}>
                <span className="flex items-center gap-2" style={{ fontSize: fs(13) }}><Icon size={14} style={{ color: inkSoft }} />{label}</span>
                <input type="checkbox" checked={accessibility[key]} onChange={(e) => setAccessibility((a) => ({ ...a, [key]: e.target.checked }))} className="h-4 w-4" />
              </label>
            ))}
          </div>
        </div>

        {installEvent && (
          <div className="mb-5">
            <button onClick={installApp} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-white" style={{ background: "#3B82F6", fontSize: fs(13) }}>
              <Download size={14} /> {t("installApp", lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
