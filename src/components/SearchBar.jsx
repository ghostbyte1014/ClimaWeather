import React from "react";
import { Search, X, Mic, MicOff, History as HistoryIcon, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { t } from "../utils/i18n.js";

export default function SearchBar({
  query, setQuery, searchOpen, setSearchOpen, searchResults, recentSearches,
  dark, ink, inkSoft, hairline, cardShadow, fs, lang, meta, voiceSearch, onSelectCity
}) {
  return (
    <div className="relative mb-3">
      <div
        className="flex items-center gap-2.5 rounded-full px-4 py-3 border backdrop-blur-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50"
        style={{
          borderColor: hairline,
          background: dark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
          boxShadow: cardShadow,
        }}
      >
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          placeholder={t("searchPlaceholder", lang)}
          aria-label="Search for a location"
          className="w-full bg-transparent outline-none placeholder:text-slate-400 font-medium"
          style={{ color: ink, fontSize: fs(13.5) }}
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="rounded-full p-1 hover:bg-black/10">
            <X size={14} style={{ color: inkSoft }} />
          </button>
        )}
        <button
          onClick={voiceSearch.startListening}
          title="Voice Search"
          aria-label="Voice Search"
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            voiceSearch.isListening
              ? "animate-pulse bg-red-500 text-white shadow-lg shadow-red-500/50"
              : "hover:bg-blue-500/10"
          }`}
        >
          {voiceSearch.isListening ? <MicOff size={15} /> : <Mic size={15} style={{ color: meta.accent }} />}
        </button>
      </div>

      {voiceSearch.isListening && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-blue-500 animate-pulse font-medium">
          <Sparkles size={12} /> {t("voiceSearchListening", lang)}
        </div>
      )}

      {searchOpen && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all" style={{ borderColor: hairline, background: dark ? "#131826" : "#FFFFFF" }}>
          {recentSearches.length > 0 && !query && (
            <div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wider uppercase" style={{ color: inkSoft }}>
              {t("recent", lang)}
            </div>
          )}
          {!query && recentSearches.map((name) => (
            <button
              key={name}
              onClick={() => { setQuery(name); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-blue-500/10 transition-colors"
            >
              <HistoryIcon size={14} style={{ color: inkSoft }} />
              <span style={{ fontSize: fs(13.5), color: ink }} className="font-medium">{name}</span>
            </button>
          ))}

          {searchResults.length > 0 ? (
            searchResults.map((c, i) => (
              <button
                key={i}
                onClick={() => onSelectCity(c)}
                className="flex w-full items-center justify-between px-4 py-3 text-left border-b last:border-none hover:bg-blue-500/10 transition-colors"
                style={{ borderColor: hairline }}
              >
                <span className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-blue-500 shrink-0" />
                  <span style={{ fontSize: fs(13.5), color: ink }} className="font-semibold">{c.name}</span>
                  <span style={{ fontSize: fs(11.5), color: inkSoft }}>{c.region}</span>
                </span>
                <ChevronRight size={15} style={{ color: inkSoft }} />
              </button>
            ))
          ) : (
            query.length >= 2 && <div className="px-4 py-3.5 text-center text-xs" style={{ color: inkSoft }}>Searching multi-level Philippines & global locations...</div>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="w-full border-t py-2.5 text-center font-medium hover:bg-black/5 transition-colors"
            style={{ borderColor: hairline, color: inkSoft, fontSize: fs(12) }}
          >
            {t("close", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
