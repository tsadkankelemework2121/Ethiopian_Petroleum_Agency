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

   
    // MAP START (MapLibre Setup)
   
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", // Free dark map
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    mapRef.current = map;

   
    //  ADD MARKERS
 
    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className =
        "w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow";

      const marker = new maplibregl.Marker(el)
        .setLngLat([m.position.lng, m.position.lat])
        .addTo(map);

      el.addEventListener("click", () => {
        onMarkerSelect?.(m.id);
      });
    });

    return () => map.remove();
  
    // MAP END
   
  }, [center, zoom, markers, onMarkerSelect]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[500px] rounded-xl overflow-hidden"
    />
  );
}
