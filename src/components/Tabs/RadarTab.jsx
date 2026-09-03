import React, { Suspense, lazy } from "react";

const RadarMap = lazy(() => import("../RadarMap.jsx"));

export default function RadarTab({ lat, lon, dark }) {
  return (
    <div className="mt-5 space-y-2">
      <div className="text-xs font-medium opacity-70">Real-Time RainViewer Precipitation Radar Map</div>
      <Suspense fallback={<div className="h-64 rounded-2xl bg-black/10 flex items-center justify-center text-xs">Loading Radar Map...</div>}>
        <RadarMap lat={lat} lon={lon} dark={dark} />
      </Suspense>
    </div>
  );
}
