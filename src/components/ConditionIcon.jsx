import React from "react";
import { CONDITION_META } from "../constants/conditionMeta.js";

export default function ConditionIcon({ condition, size = 20, className = "", spin = false }) {
  const meta = CONDITION_META[condition] || CONDITION_META.cloudy;
  const Icon = meta.Icon;
  return <Icon size={size} className={`${className} ${spin ? "animate-[spin_9s_linear_infinite]" : ""}`} strokeWidth={1.6} />;
}
