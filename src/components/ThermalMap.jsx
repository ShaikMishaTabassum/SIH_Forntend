import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map, { Marker, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { classStyle } from "../data/classificationStyle";

function MarkerIcon({ classification, size, color, ringColor }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
  };

  const badgeSize = size + 14;

  const wrapperStyle = {
    width: badgeSize,
    height: badgeSize,
    borderRadius: "50%",
    background: `radial-gradient(circle at 35% 30%, ${color}, ${color}dd 55%, ${color}99 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: ringColor ? `3px solid ${ringColor}` : "2px solid rgba(255,255,255,0.9)",
    boxShadow: ringColor
      ? `0 4px 10px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.5)`
      : `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  };

  const highlightStyle = {
    position: "absolute",
    top: "12%",
    left: "22%",
    width: "35%",
    height: "25%",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.55)",
    filter: "blur(1px)",
    pointerEvents: "none",
  };

  const iconPaths = {
    "Wildfire": "M12 2c-1 3-3 4-3 7a3 3 0 0 0 6 0c0-1-.5-1.5-1-2 .8 2 0 3-1 3a1.5 1.5 0 0 1-1.5-1.5c0-1.5 1.5-2 1.5-4 0-1.5-1-2.5-1-2.5zM8 13a4 4 0 1 0 8 0c0-3-2-4-2-7 3 2 5 5 5 9a7 7 0 1 1-14 0c0-2 1-3.5 2-5 0 1.5 1 3 1 3z",
    "Industrial Source": "M2 21V10l5 3V10l5 3V10l5 3V7l5-3v17H2z",
    "Anomaly": "M12 2 1 21h22L12 2zm0 6 6.5 11h-13L12 8zm-.9 3v4h1.8v-4h-1.8zm0 5v1.8h1.8V16h-1.8z",
  };

  return (
    <div style={wrapperStyle}>
      <div style={highlightStyle} />
      <svg {...commonProps} fill="white" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        <path d={iconPaths[classification] || iconPaths["Anomaly"]} />
      </svg>
    </div>
  );
}

export default function ThermalMap({ hotspots, selectedId, onSelectHotspot }) {
  const mapRef = useRef(null);
  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

  const [activeFilters, setActiveFilters] = useState({
    "Industrial Source": true,
    "Wildfire": true,
    "Anomaly": true,
  });

  const visibleHotspots = hotspots.filter((h) => activeFilters[h.classification]);
  const selected = visibleHotspots.find((h) => h.id === selectedId);

  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.flyTo({
        center: [selected.lng, selected.lat],
        zoom: 9,
        pitch: 55,
        bearing: -10,
        duration: 1800,
      });
    }
  }, [selectedId]);

  function toggleFilter(category) {
    setActiveFilters((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 83.5, latitude: 19.5, zoom: 6.5, pitch: 45, bearing: -10 }}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        mapStyle={"https://api.maptiler.com/maps/hybrid/style.json?key=" + mapTilerKey}
        terrain={{ source: "terrain-dem", exaggeration: 1.5 }}
      >
        <Source
          id="terrain-dem"
          type="raster-dem"
          url={"https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=" + mapTilerKey}
          tileSize={256}
        />

        {visibleHotspots.map((h) => {
          const color = classStyle[h.classification] ? classStyle[h.classification].color : "#999";
          const isSelected = selectedId === h.id;
          return (
            <Marker
              key={h.id}
              longitude={h.lng}
              latitude={h.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onSelectHotspot(h.id);
              }}
            >
              <MarkerIcon
                classification={h.classification}
                size={isSelected ? 20 : 15}
                color={color}
                ringColor={isSelected ? "#B8923A" : null}
              />
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => onSelectHotspot(null)}
            closeOnClick={false}
          >
            <div className="font-sans text-charcoal p-1">
              <div className="font-serif font-bold text-sm">{selected.name}</div>
              <span
                className="inline-block text-xs text-white px-2 py-0.5 rounded mt-1"
                style={{ background: classStyle[selected.classification] ? classStyle[selected.classification].color : "#999" }}
              >
                {selected.classification}
              </span>
              <div className="text-xs mt-2 text-gray-600">
                {selected.confidence}% confidence / {selected.brightness}K brightness /{" "}
                {selected.persistence}% persistence over {selected.observedDays} days observed
              </div>
              <div className="text-xs italic mt-2">
                First detected {selected.firstDetected} - Priority {selected.priorityScore}
              </div>
              <Link to={"/facility/" + selected.id} className="text-xs text-gold underline mt-2 block">
                View Full Timeline
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute top-4 left-4 bg-ivory/95 border border-charcoal/20 rounded-lg px-4 py-3 shadow-md">
        <div className="text-xs font-serif font-bold text-charcoal mb-2">Classify & Filter</div>
        {Object.keys(activeFilters).map((category) => (
          <label key={category} className="flex items-center gap-2 mb-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeFilters[category]}
              onChange={() => toggleFilter(category)}
              className="accent-teal w-3.5 h-3.5"
            />
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: classStyle[category] ? classStyle[category].color : "#999" }}
            />
            <span className="text-xs text-charcoal">{category}</span>
            <span className="text-xs text-gray-400 ml-auto">
              ({hotspots.filter((h) => h.classification === category).length})
            </span>
          </label>
        ))}
      </div>

      <div className="absolute top-4 right-4 bg-ivory/95 border border-charcoal/20 rounded-lg px-4 py-3 shadow-md">
        <div className="flex items-center gap-2 mb-1.5">
          <MarkerIcon classification="Industrial Source" size={10} color="#0F6B6E" />
          <span className="text-xs text-charcoal">Industrial Source</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <MarkerIcon classification="Wildfire" size={10} color="#D64545" />
          <span className="text-xs text-charcoal">Wildfire</span>
        </div>
        <div className="flex items-center gap-2">
          <MarkerIcon classification="Anomaly" size={10} color="#D9A521" />
          <span className="text-xs text-charcoal">Anomaly</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-ivory/95 border border-charcoal/20 rounded-lg px-4 py-2 shadow-md">
        <span className="text-xs font-serif font-bold text-charcoal">
          Showing {visibleHotspots.length} of {hotspots.length} - {hotspots.filter((h) => h.classification === "Industrial Source").length} Industrial /{" "}
          {hotspots.filter((h) => h.priorityScore >= 8).length} High Priority
        </span>
      </div>
    </div>
  );
}
