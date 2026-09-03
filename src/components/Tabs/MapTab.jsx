import React, { useEffect, useRef, useState } from "react";

const MAP_LAYERS = [
  { key: "street", label: "Street View", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" },
  { key: "dark", label: "Dark View", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" },
  { key: "satellite", label: "Satellite View", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
  { key: "topo", label: "Terrain / Topo", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" },
];

export default function MapTab({ lat, lon, locationName, dark, hairline, cardBg, cardShadow, fs }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("street");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initMap() {
      // Inject Leaflet CSS if missing
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      // Inject Leaflet JS if missing
      if (!window.L) {
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

      // Create map instance
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [lat, lon],
          zoom: 11,
          zoomControl: true,
          attributionControl: false,
        });

        const selectedLayerObj = MAP_LAYERS.find((l) => l.key === activeLayer) || MAP_LAYERS[0];
        const tileLayer = L.tileLayer(selectedLayerObj.url, { maxZoom: 18 });
        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;

        // Custom pin marker
        L.circleMarker([lat, lon], {
          radius: 9,
          fillColor: "#3B82F6",
          color: "#FFFFFF",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map).bindPopup(`<b>${locationName}</b><br/>Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`).openPopup();

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([lat, lon], 11);
      }

      if (active) setLoading(false);
    }

    initMap();

    return () => {
      active = false;
    };
  }, [lat, lon, locationName]);

  // Handle Layer Switching
  function switchLayer(layerKey) {
    setActiveLayer(layerKey);
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    const selectedObj = MAP_LAYERS.find((l) => l.key === layerKey);
    if (!selectedObj) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(selectedObj.url, { maxZoom: 18 });
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }

  return (
    <div className="mt-5 space-y-3">
      {/* Layer Toggle Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {MAP_LAYERS.map((layer) => {
          const isActive = activeLayer === layer.key;
          return (
            <button
              key={layer.key}
              onClick={() => switchLayer(layer.key)}
              className="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all"
              style={{
                borderColor: isActive ? "#3B82F6" : hairline,
                background: isActive ? "#3B82F626" : cardBg,
                color: isActive ? (dark ? "#FFFFFF" : "#1E3A8A") : dark ? "#9AA3B8" : "#5C6B7E",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {layer.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Map Container */}
      <div className="relative w-full overflow-hidden rounded-3xl border" style={{ borderColor: hairline, boxShadow: cardShadow }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-xs text-white backdrop-blur-sm">
            Loading Map View...
          </div>
        )}
        <div ref={mapRef} className="h-80 w-full" />
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs" style={{ background: dark ? "#131826" : "#FFFFFF", borderColor: hairline }}>
          <span className="font-semibold">{locationName}</span>
          <span className="opacity-70">100% Free Map Tiles (CartoDB & Esri ArcGIS)</span>
        </div>
      </div>
    </div>
  );
}
