import React from "react";
import { X, ShieldCheck, Lock, EyeOff, HardDrive, Globe, Heart } from "lucide-react";

export default function PrivacyModal({ isOpen, onClose, dark, ink, inkSoft, hairline, fs }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-2xl transition-all"
        style={{ background: dark ? "#131826" : "#FFFFFF", color: ink }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: hairline }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            <h2 className="font-semibold" style={{ fontSize: fs(16) }}>Privacy Policy</h2>
          </div>
          <button onClick={onClose} aria-label="Close privacy policy"><X size={18} style={{ color: inkSoft }} /></button>
        </div>

        <p className="mb-4 text-xs" style={{ color: inkSoft, lineHeight: 1.6 }}>
          At <strong>ClimaWeather</strong> by <strong>GhostByte</strong>, we believe your privacy should be simple, transparent, and hassle-free. No confusing legal jargon! Here is how we treat your privacy:
        </p>

        {/* Layman's Terms Privacy Cards */}
        <div className="space-y-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 font-semibold text-xs text-emerald-400">
              <EyeOff size={15} /> 1. We Do NOT Track or Collect Personal Data
            </div>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.5 }}>
              We do not ask for your name, email, phone number, or account signup. We do not track your browsing history or collect analytics profile data.
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
              <Lock size={15} /> 2. How Your Location Is Used
            </div>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.5 }}>
              Your GPS or IP location is processed strictly inside your device's browser to fetch local weather forecasts from Open-Meteo. Your location is <strong>never stored on external servers</strong> or sold to third parties.
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 font-semibold text-xs text-purple-400">
              <HardDrive size={15} /> 3. Everything Stays On Your Device
            </div>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.5 }}>
              Your saved favorite cities, temperature unit preferences, and cached weather forecasts are saved locally on your device (in browser IndexedDB). They stay on your phone or computer.
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: hairline, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-400">
              <Globe size={15} /> 4. Free Open Public APIs
            </div>
            <p className="mt-1 text-[11.5px]" style={{ color: inkSoft, lineHeight: 1.5 }}>
              We fetch weather metrics from free public endpoints (Open-Meteo, OpenStreetMap, GeoJS) solely to deliver live forecasts. No advertising cookies or tracking scripts are used.
            </p>
          </div>
        </div>

        {/* Copyright Footer Notice */}
        <div className="mt-5 border-t pt-4 text-center text-xs" style={{ borderColor: hairline, color: inkSoft }}>
          <div className="flex items-center justify-center gap-1 font-semibold text-slate-200">
            © {new Date().getFullYear()} GhostByte. All rights reserved.
          </div>
          <p className="mt-0.5 text-[11px]">Crafted with <Heart size={10} className="inline text-red-500 fill-red-500" /> for weather enthusiasts worldwide.</p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Close Privacy Policy
        </button>
      </div>
    </div>
  );
}
