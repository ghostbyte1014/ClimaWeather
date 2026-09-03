import React, { useEffect, useRef, useState } from "react";

/**
 * Real Interactive Radar Map powered by Leaflet and RainViewer API.
 * Dynamically loads Leaflet library and renders real-time precipitation radar tiles.
 */
export default function RadarMap({ lat, lon, dark }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const radarTileLayerRef = useRef(null);
  const [radarTimestamps, setRadarTimestamps] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Leaflet dynamically if not loaded
  useEffect(() => {
    let active = true;

    async function initMap() {
      if (!window.L) {
        // Inject Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        // Inject Leaflet JS
        await new Promise((resolve) => {
          if (document.getElementById("leaflet-js")) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!active || !mapRef.current) return;

      const L = window.L;
      if (!L) return;

      // Initialize map instance if not existing
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [lat, lon],
          zoom: 7,
          zoomControl: true,
          attributionControl: false,
        });

        // Add base dark/light tile layer
        const tileUrl = dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);

        // Add current location marker
        L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: "#3B82F6",
          color: "#FFFFFF",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup("Your Location");

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([lat, lon], 7);
      }

      // Fetch RainViewer real radar timestamps
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        const data = await res.json();
        if (data && data.radar && data.radar.past) {
          const pastFrames = data.radar.past;
          if (active) {
            setRadarTimestamps(pastFrames);
            const latestIndex = pastFrames.length - 1;
            setCurrentFrameIndex(latestIndex);
            updateRadarTile(pastFrames[latestIndex].time);
          }
        }
      } catch (err) {
        console.warn("RainViewer API fetch failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    initMap();

    return () => {
      active = false;
    };
  }, [lat, lon, dark]);

  // Function to update radar tile layer on map
  function updateRadarTile(timestamp) {
    const L = window.L;
    if (!L || !mapInstanceRef.current || !timestamp) return;

    if (radarTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarTileLayerRef.current);
    }

    const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`;
    const newLayer = L.tileLayer(radarUrl, {
      opacity: 0.7,
      maxZoom: 18,
      tileSize: 256,
    });

    newLayer.addTo(mapInstanceRef.current);
    radarTileLayerRef.current = newLayer;
  }

  // Animation player loop
  useEffect(() => {
    if (!isPlaying || radarTimestamps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % radarTimestamps.length;
        updateRadarTile(radarTimestamps[next].time);
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, radarTimestamps]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-xs text-white backdrop-blur-sm">
          Loading Live Radar Tiles...
        </div>
      )}
      <div ref={mapRef} className="h-64 w-full" />
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs" style={{ background: dark ? "#131826" : "#FFFFFF", borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-md px-2.5 py-1 font-medium transition-colors"
          style={{ background: isPlaying ? "#EF4444" : "#3B82F6", color: "#FFFFFF" }}
        >
          {isPlaying ? "Pause Radar" : "Play Past 2 Hours"}
        </button>
        <span style={{ color: dark ? "#9AA3B8" : "#5C6B7E" }}>
          {currentFrameIndex >= 0 && radarTimestamps[currentFrameIndex]
            ? `Radar Time: ${new Date(radarTimestamps[currentFrameIndex].time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : "Live Radar Layer"}
        </span>
      </div>
    </div>
  );
}
