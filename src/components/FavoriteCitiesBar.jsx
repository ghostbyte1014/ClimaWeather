import React from "react";
import { Star, X, Plus } from "lucide-react";

export default function FavoriteCitiesBar({
  savedCities = [],
  activeCity,
  onSelectCity,
  onRemoveFavorite,
  onToggleFavorite,
  dark,
  ink,
  inkSoft,
  hairline,
  fs,
  meta,
}) {
  const isCurrentSaved = activeCity && savedCities.some(
    (c) => c.name.toLowerCase() === activeCity.name.toLowerCase()
  );

  return (
    <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase shrink-0 mr-1" style={{ color: inkSoft }}>
        <Star size={12} className="text-amber-400 fill-amber-400" /> Favorites:
      </div>

      {/* List of Saved Favorite Cities */}
      {savedCities.map((city) => {
        const isActive = activeCity?.name?.toLowerCase() === city.name.toLowerCase();
        return (
          <div
            key={city.name}
            className={`group flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
              isActive ? "shadow-md scale-105" : "hover:border-amber-400/50"
            }`}
            style={{
              borderColor: isActive ? meta.accent : hairline,
              background: isActive
                ? meta.accent + "22"
                : dark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
              color: isActive ? meta.accent : ink,
            }}
            onClick={() => onSelectCity(city)}
          >
            <Star size={12} className={isActive ? "text-amber-400 fill-amber-400" : "text-amber-400"} />
            <span style={{ fontSize: fs(12) }}>{city.name}</span>
            {savedCities.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(city.name);
                }}
                className="opacity-60 hover:opacity-100 rounded-full p-0.5 hover:bg-black/10 transition-opacity"
                title={`Remove ${city.name} from favorites`}
              >
                <X size={11} style={{ color: inkSoft }} />
              </button>
            )}
          </div>
        );
      })}

      {/* [+ Add Favorite] Pill Button */}
      {!isCurrentSaved && activeCity && (
        <button
          onClick={() => onToggleFavorite(activeCity)}
          className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 shrink-0 hover:bg-amber-500/10 hover:border-amber-400"
          style={{
            borderColor: hairline,
            color: "#F59E0B",
            background: dark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.08)",
          }}
          title={`Add ${activeCity.name} to favorites`}
        >
          <Plus size={13} />
          <span style={{ fontSize: fs(12) }}>Add Favorite</span>
        </button>
      )}
    </div>
  );
}
