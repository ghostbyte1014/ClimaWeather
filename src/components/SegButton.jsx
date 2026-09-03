import React from "react";

export default function SegButton({ active, onClick, children, accent, ink, inkSoft }) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
      style={{ background: active ? accent + "30" : "transparent", color: active ? ink : inkSoft }}
    >
      {children}
    </button>
  );
}
