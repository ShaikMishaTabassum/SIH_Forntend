import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Map, { Marker, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { classStyle } from "../data/classificationStyle";

export default function ThermalMap({ hotspots, selectedId, onSelectHotspot }) {
  const mapRef = useRef(null);
  const selected = hotspots.find((h) => h.id === selectedId);

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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 80, latitude: 22, zoom: 4.2, pitch: 45, bearing: -10 }}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        terrain={{ source: "terrain-dem", exaggeration: 1.5 }}
      >
        <Source
          id="terrain-dem"
          type="raster-dem"
          tiles={["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"]}
          tileSize={256}
          encoding="terrarium"
          maxzoom={15}
        />

        {hotspots.map((h) => (
          <Marker
            key={h.id}
            longitude={h.lng}
            latitude={h.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectHotspot(h.id);
            }}
          >
            <div
              style={{
                width: selectedId === h.id ? 20 : 16,
                height: selectedId === h.id ? 20 : 16,
                borderRadius: "50%",
                background: classStyle[h.classification] ? classStyle[h.classification].color : "#999",
                border: selectedId === h.id ? "3px solid #B8923A" : "2px solid white",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                transition: "all 0.2s ease",
              }}
            />
          </Marker>
        ))}

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
    </div>
  );
}
