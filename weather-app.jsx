import React, { useState, useEffect, useCallback } from "react";
import { WifiOff, AlertTriangle, X, AlertCircle, Loader2 } from "lucide-react";

import { fetchRealWeather, searchCities, reverseGeocode, fetchIPLocation } from "./src/services/openMeteo.js";
import { saveCachedWeather, getCachedWeather, saveSetting, getSetting } from "./src/utils/db.js";
import { t } from "./src/utils/i18n.js";
import { useVoiceSearch } from "./src/hooks/useVoiceSearch.js";
import { DEFAULT_CITIES, CONDITION_META } from "./src/constants/conditionMeta.js";

import ErrorBoundary from "./src/components/ErrorBoundary.jsx";
import WeatherAtmosphere from "./src/components/WeatherAtmosphere.jsx";
import Header from "./src/components/Header.jsx";
import SearchBar from "./src/components/SearchBar.jsx";
import HeroCard from "./src/components/HeroCard.jsx";
import DailyBriefing from "./src/components/DailyBriefing.jsx";
import MetricsGrid from "./src/components/MetricsGrid.jsx";
import SegButton from "./src/components/SegButton.jsx";

import TodayTab from "./src/components/Tabs/TodayTab.jsx";
import EnvironmentTab from "./src/components/Tabs/EnvironmentTab.jsx";
import MapTab from "./src/components/Tabs/MapTab.jsx";
import HistoryTab from "./src/components/Tabs/HistoryTab.jsx";
import CompareTab from "./src/components/Tabs/CompareTab.jsx";
import SettingsDrawer from "./src/components/SettingsDrawer.jsx";
import WeatherGuideModal from "./src/components/WeatherGuideModal.jsx";
import PrivacyModal from "./src/components/PrivacyModal.jsx";

function WeatherAppContent() {
  // Service Worker registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }, []);

  // Theme & Settings
  const [themeMode, setThemeMode] = useState("dark");
  const [systemDark, setSystemDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [accessibility, setAccessibility] = useState({ largeText: false, reducedMotion: false, highContrast: false });

  useEffect(() => {
    getSetting("lang", "en").then(setLang);
    getSetting("themeMode", "dark").then(setThemeMode);
  }, []);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const h = (e) => setSystemDark(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  const dark = themeMode === "auto" ? systemDark : themeMode === "dark";
  const fs = useCallback((px) => (accessibility.largeText ? Math.round(px * 1.18) : px), [accessibility.largeText]);

  // Units
  const [unit] = useState("C");
  const [speedUnit] = useState("kph");
  const temp = useCallback((c) => (unit === "C" ? Math.round(c) : Math.round((c * 9) / 5 + 32)), [unit]);
  const speed = useCallback((kph) => (speedUnit === "kph" ? `${Math.round(kph)} km/h` : `${Math.round(kph * 0.621371)} mph`), [speedUnit]);

  // Location & Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(DEFAULT_CITIES[0]);
  const [saved, setSaved] = useState([DEFAULT_CITIES[0].name]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Voice Search Hook
  const handleVoiceResult = useCallback((spokenCity) => {
    setQuery(spokenCity);
    searchCities(spokenCity).then((results) => {
      if (results && results.length > 0) selectCity(results[0]);
    });
  }, []);
  const voiceSearch = useVoiceSearch(handleVoiceResult);

  // Weather Data & Network State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // Tabs & Panels & Guide / Privacy Modals
  const [tab, setTab] = useState("today");
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [selectedGuideKey, setSelectedGuideKey] = useState(null);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [compareCityName, setCompareCityName] = useState("Tokyo");
  const [compareData, setCompareData] = useState(null);

  // Notifications & PWA
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [shareCopied, setShareCopied] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);

  const load = useCallback(async (city, { force = false } = {}) => {
    force ? setRefreshing(true) : setLoading(true);
    setError(null);
    const dbKey = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;

    try {
      if (!navigator.onLine || !force) {
        const cached = await getCachedWeather(dbKey);
        if (cached && (!navigator.onLine || Date.now() - new Date(cached.fetchedAt).getTime() < 10 * 60 * 1000)) {
          setData({ ...cached, __stale: !navigator.onLine });
          setLoading(false);
          setRefreshing(false);
          if (!navigator.onLine) return;
        }
      }
      const realData = await fetchRealWeather(city);
      setData(realData);
      setSelectedDayIdx(0);
      await saveCachedWeather(dbKey, realData);
    } catch (e) {
      const cached = await getCachedWeather(dbKey);
      if (cached) setData({ ...cached, __stale: true });
      else setError(e.message || "Failed to load weather data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Dual Geolocation lookup (Browser GPS -> Automatic IP Location Fallback)
  useEffect(() => {
    async function fallbackToIP() {
      const ipLoc = await fetchIPLocation();
      if (ipLoc) {
        setActiveCity(ipLoc);
        load(ipLoc);
      } else {
        load(activeCity);
      }
    }

    if (!("geolocation" in navigator)) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setActiveCity(loc);
          load(loc);
        } catch (e) {
          fallbackToIP();
        }
      },
      () => fallbackToIP(),
      { timeout: 4000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search autocomplete
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchCities(query);
      setSearchResults(res);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Network offline/online listeners
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // PWA install prompt handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Compare tab data loader
  useEffect(() => {
    if (tab !== "compare") return;
    const city = DEFAULT_CITIES.find((c) => c.name === compareCityName) || DEFAULT_CITIES[0];
    let cancelled = false;
    fetchRealWeather(city)
      .then((d) => { if (!cancelled) setCompareData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [tab, compareCityName]);

  function selectCity(city) {
    setActiveCity(city);
    setQuery("");
    setSearchOpen(false);
    setRecentSearches((r) => [city.name, ...r.filter((n) => n !== city.name)].slice(0, 5));
    load(city, { force: true });
  }

  function toggleSave(cityName) {
    setSaved((s) => (s.includes(cityName) ? s.filter((n) => n !== cityName) : [...s, cityName]));
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    } catch (e) {}
  }

  async function shareWeather() {
    if (!data) return;
    const c = data.current;
    const text = `${data.location.name}: ${temp(c.tempC)}°C, ${c.conditionLabel}.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Weather", text }); } catch (e) {}
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (e) {}
    }
  }

  async function installApp() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  const meta = CONDITION_META[data?.current?.condition] || CONDITION_META["partly-cloudy"];
  const pageBg = accessibility.highContrast ? (dark ? "#000000" : "#FFFFFF") : dark ? "#0B0F1A" : "#F3F6FB";
  const ink = accessibility.highContrast ? (dark ? "#FFFFFF" : "#000000") : dark ? "#EDEFF5" : "#101828";
  const inkSoft = accessibility.highContrast ? (dark ? "#E5E5E5" : "#111111") : dark ? "#9AA3B8" : "#5C6B7E";
  const hairline = accessibility.highContrast ? (dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)") : dark ? "rgba(255,255,255,0.09)" : "rgba(16,24,40,0.08)";
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const cardShadow = dark ? "none" : "0 2px 14px rgba(16,24,40,0.06)";

  const activeDay = data?.daily?.[selectedDayIdx] || data?.daily?.[0];
  const displayData = data ? {
    ...data,
    current: selectedDayIdx === 0 ? data.current : {
      ...data.current,
      tempC: activeDay.hiC,
      feelsLikeC: activeDay.heatIndexHiC,
      condition: activeDay.condition,
      conditionLabel: activeDay.condition === "storm" ? "Thunderstorms" : activeDay.condition === "rain" ? "Rainy" : activeDay.condition === "drizzle" ? "Light Drizzle" : activeDay.condition === "cloudy" ? "Overcast" : activeDay.condition === "partly-cloudy" ? "Partly Cloudy" : "Sunny",
      highC: activeDay.hiC,
      lowC: activeDay.loC,
      heatIndexHiC: activeDay.heatIndexHiC,
      precipChance: activeDay.precipChance,
      humidity: activeDay.hourly?.[12]?.humidity || data.current.humidity,
      windKph: activeDay.hourly?.[12]?.windKph || data.current.windKph,
      uvIndex: activeDay.hourly?.[12]?.uvIndex || data.current.uvIndex,
      sunrise: activeDay.sunrise || data.current.sunrise,
      sunset: activeDay.sunset || data.current.sunset,
      sunriseIso: activeDay.sunriseIso || data.current.sunriseIso,
      sunsetIso: activeDay.sunsetIso || data.current.sunsetIso,
    }
  } : null;

  const visibleAlerts = (data?.alerts || []).filter((a) => !dismissedAlerts.includes(a.id));
  const TABS = [
    { key: "today", label: t("today", lang) },
    { key: "environment", label: t("airAndPollen", lang) },
    { key: "map", label: "Map View" },
    { key: "history", label: t("history", lang) },
    { key: "compare", label: t("compare", lang) },
  ];

  return (
    <div className="relative min-h-full w-full overflow-hidden transition-colors duration-500" style={{ background: pageBg, color: ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <WeatherAtmosphere condition={data?.current?.condition || "clear-day"} isNight={dark} reducedMotion={accessibility.reducedMotion} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <Header
          lang={lang} fs={fs} meta={meta} dark={dark} inkSoft={inkSoft} refreshing={refreshing} loading={loading}
          notifPermission={notifPermission} onShare={shareWeather} onRequestNotif={requestNotifications}
          onRefresh={() => load(activeCity, { force: true })} onOpenSettings={() => setSettingsOpen(true)}
        />

        {shareCopied && <div className="mb-3 rounded-lg px-3 py-1.5 text-[12px]" style={{ background: meta.accent + "22", color: ink }}>Copied weather summary to clipboard.</div>}

        {!isOnline && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border px-4 py-2.5" style={{ borderColor: hairline, background: cardBg, boxShadow: cardShadow }}>
            <WifiOff size={14} style={{ color: inkSoft }} />
            <span style={{ fontSize: fs(12.5), color: inkSoft }}>{t("offlineNotice", lang)}</span>
          </div>
        )}

        {visibleAlerts.map((a) => (
          <div key={a.id} className="mb-3 flex items-start gap-2.5 rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(224,84,84,0.4)", background: "rgba(224,84,84,0.09)" }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "#E05454" }} />
            <div className="flex-1">
              <div style={{ fontSize: fs(13) }} className="font-semibold">{a.title} · {a.window}</div>
              <div style={{ fontSize: fs(12.5), color: inkSoft }}>{a.message}</div>
            </div>
            <button onClick={() => setDismissedAlerts((d) => [...d, a.id])} aria-label="Dismiss alert"><X size={14} style={{ color: inkSoft }} /></button>
          </div>
        ))}

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(224,84,84,0.35)", background: "rgba(224,84,84,0.08)" }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#E05454" }} />
            <div style={{ fontSize: fs(13), color: dark ? "#F5B8B8" : "#8A2E2E" }}>
              {error} <button onClick={() => load(activeCity, { force: true })} className="font-medium underline">Try again</button>
            </div>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl py-20" style={{ background: cardBg, boxShadow: cardShadow }}>
            <Loader2 size={22} className="animate-spin" style={{ color: meta.accent }} />
            <span style={{ fontSize: fs(13), color: inkSoft }}>Fetching real weather...</span>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column (Hero, Search, Daily Briefing, Metrics) */}
            <div className="space-y-4 lg:col-span-5 xl:col-span-4">
              <SearchBar
                query={query} setQuery={setQuery} searchOpen={searchOpen} setSearchOpen={setSearchOpen}
                searchResults={searchResults} recentSearches={recentSearches} dark={dark} ink={ink} inkSoft={inkSoft}
                hairline={hairline} cardShadow={cardShadow} fs={fs} lang={lang} meta={meta} voiceSearch={voiceSearch}
                onSelectCity={selectCity}
              />
              <HeroCard data={displayData} dark={dark} meta={meta} fs={fs} temp={temp} saved={saved} onToggleSave={toggleSave} reducedMotion={accessibility.reducedMotion} />
              <DailyBriefing data={displayData} briefingOpen={briefingOpen} setBriefingOpen={setBriefingOpen} meta={meta} fs={fs} inkSoft={inkSoft} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} />
              <MetricsGrid data={displayData} dark={dark} fs={fs} speed={speed} onOpenGuide={(key) => { setSelectedGuideKey(key); setGuideModalOpen(true); }} />
            </div>

            {/* Right Column (Tabs & Main Chart/Forecast Content) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="flex gap-1 overflow-x-auto rounded-full border p-1" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.03)" : "#FFFFFF", boxShadow: cardShadow, scrollbarWidth: "none" }}>
                {TABS.map((t) => (
                  <SegButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} accent={meta.accent} ink={ink} inkSoft={inkSoft}>{t.label}</SegButton>
                ))}
              </div>

              {tab === "today" && <TodayTab data={data} selectedDayIdx={selectedDayIdx} setSelectedDayIdx={setSelectedDayIdx} dark={dark} meta={meta} fs={fs} temp={temp} lang={lang} ink={ink} inkSoft={inkSoft} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} />}
              {tab === "environment" && <EnvironmentTab data={data} dark={dark} fs={fs} lang={lang} inkSoft={inkSoft} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} />}
              {tab === "map" && <MapTab lat={data.location.lat} lon={data.location.lon} locationName={data.location.name} dark={dark} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} fs={fs} />}
              {tab === "history" && <HistoryTab data={data} temp={temp} fs={fs} inkSoft={inkSoft} hairline={hairline} />}
              {tab === "compare" && <CompareTab activeCity={activeCity} data={data} compareCityName={compareCityName} setCompareCityName={setCompareCityName} compareData={compareData} temp={temp} fs={fs} ink={ink} inkSoft={inkSoft} hairline={hairline} cardBg={cardBg} cardShadow={cardShadow} />}
            </div>
          </div>
        )}

        {/* GhostByte Page Footer */}
        <footer className="mt-10 border-t pt-6 text-center text-xs" style={{ borderColor: hairline, color: inkSoft }}>
          <div className="flex items-center justify-center gap-3">
            <span>© {new Date().getFullYear()} <strong>GhostByte</strong>. All rights reserved.</span>
            <span>•</span>
            <button onClick={() => setPrivacyModalOpen(true)} className="text-emerald-400 hover:underline font-medium">
              Privacy Policy
            </button>
          </div>
        </footer>
      </div>

      <SettingsDrawer
        settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} lang={lang} setLang={setLang}
        themeMode={themeMode} setThemeMode={setThemeMode} accessibility={accessibility} setAccessibility={setAccessibility}
        installEvent={installEvent} installApp={installApp} saveSetting={saveSetting} dark={dark} ink={ink}
        inkSoft={inkSoft} hairline={hairline} fs={fs} meta={meta}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
      />

      <WeatherGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        selectedKey={selectedGuideKey}
        dark={dark}
        ink={ink}
        inkSoft={inkSoft}
        hairline={hairline}
        fs={fs}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        dark={dark}
        ink={ink}
        inkSoft={inkSoft}
        hairline={hairline}
        fs={fs}
      />
    </div>
  );
}

export default function WeatherApp() {
  return (
    <ErrorBoundary>
      <WeatherAppContent />
    </ErrorBoundary>
  );
}
