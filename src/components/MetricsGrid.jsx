import React from "react";
import { Droplets, Wind, Gauge, Eye, Sun, CloudRain } from "lucide-react";
import MetricCard from "./MetricCard.jsx";

export default function MetricsGrid({ data, dark, fs, speed, onOpenGuide }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      <MetricCard icon={Droplets} label="Humidity" value={`${data.current.humidity}%`} dark={dark} fs={fs} chip="#2563EB" onInfoClick={() => onOpenGuide?.("humidity")} />
      <MetricCard icon={Wind} label="Wind" value={speed(data.current.windKph)} sub={data.current.windDir} dark={dark} fs={fs} chip="#0D9488" onInfoClick={() => onOpenGuide?.("wind")} />
      <MetricCard icon={Gauge} label="Pressure" value={`${data.current.pressureHpa} hPa`} dark={dark} fs={fs} chip="#7C3AED" onInfoClick={() => onOpenGuide?.("pressure")} />
      <MetricCard icon={Eye} label="Visibility" value={`${data.current.visibilityKm} km`} dark={dark} fs={fs} chip="#64748B" onInfoClick={() => onOpenGuide?.("visibility")} />
      <MetricCard icon={Sun} label="UV Index" value={data.current.uvIndex} sub={data.current.uvIndex >= 7 ? "High" : data.current.uvIndex >= 3 ? "Moderate" : "Low"} dark={dark} fs={fs} chip="#F2994A" onInfoClick={() => onOpenGuide?.("uvIndex")} />
      <MetricCard icon={CloudRain} label="Precipitation" value={`${data.current.precipChance}%`} dark={dark} fs={fs} chip="#0284C7" onInfoClick={() => onOpenGuide?.("heatIndex")} />
    </div>
  );
}
