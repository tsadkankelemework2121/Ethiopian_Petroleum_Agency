import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Position = {
  lat: number;
  lng: number;
};

type MarkerType = {
  id: string;
  position: Position;
  label?: string;
  subtitle?: string;
  status?: string;
  color?: string;
};

type Props = {
  center: Position;
  zoom?: number;
  markers?: MarkerType[];
  selectedMarkerId?: string;
  onMarkerSelect?: (id: string) => void;
};

export default function MapView({
  center,
  zoom = 9,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // ================================
    // 🗺️ MAP INITIALIZATION
    // Google-like light style
    // ================================
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [center.lng, center.lat],
      zoom,
    });

    mapRef.current = map;

    // ================================
    // 🚛 ADD VEHICLE MARKERS
    // ================================
    markers.forEach((m) => {
      const el = document.createElement("div");

      const isSelected = m.id === selectedMarkerId;

      el.innerHTML = `
        <div style="
          width:${isSelected ? 42 : 36}px;
          height:${isSelected ? 42 : 36}px;
          background:${m.color ?? "white"};
          border-radius:10px;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 4px 10px rgba(0,0,0,0.15);
          border:2px solid ${isSelected ? "#06b6d4" : "#e5e7eb"};
          cursor:pointer;
          transition:all 0.2s ease;
        ">
          <span style="font-size:${isSelected ? 20 : 18}px">🚚</span>
        </div>
      `;

      new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([m.position.lng, m.position.lat])
        .addTo(map);

      el.addEventListener("click", () => {
        onMarkerSelect?.(m.id);
      });
    });

    return () => map.remove();
  }, [center, zoom, markers, selectedMarkerId, onMarkerSelect]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border bg-white"
    />
  );
}