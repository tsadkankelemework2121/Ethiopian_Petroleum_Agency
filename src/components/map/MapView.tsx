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
};

type Props = {
  center: Position;
  zoom?: number;
  markers?: MarkerType[];
  selectedMarkerId?: string;
  onMarkerSelect?: (id: string) => void;
  compact?: boolean;
};

export default function MapView({
  center,
  zoom = 9,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
  compact = false,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

   
    // MAP START (MapLibre Setup)
   
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // Free map
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    mapRef.current = map;

   
    //  ADD MARKERS
 
    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className =
        m.id === selectedMarkerId
          ? "w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 border-2 border-white shadow-lg"
          : "w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 border-2 border-white shadow-lg";

      new maplibregl.Marker(el)
        .setLngLat([m.position.lng, m.position.lat])
        .addTo(map);

      el.addEventListener("click", () => {
        onMarkerSelect?.(m.id);
      });
    });

    return () => map.remove();
  
    // MAP END
   
  }, [center, zoom, markers, selectedMarkerId, onMarkerSelect]);

  return (
    <div
      ref={mapContainer}
      className={
        compact
          ? "w-full h-48 rounded-xl overflow-hidden"
          : "w-full h-[500px] rounded-xl overflow-hidden"
      }
    />
  );
}
