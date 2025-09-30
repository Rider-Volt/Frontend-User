// src/components/Map.tsx
import { useEffect, useRef } from "react";
import type { RentalPoint } from "@/services/stationServices";

type MapProps = {
  points: RentalPoint[];
  selectedPointId?: number;
  onPointPositionChange?: (pointId: number, lat: number, lng: number) => void;
};

export default function Map({ points, selectedPointId, onPointPositionChange }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});

  useEffect(() => {
    const ensureLeaflet = async () => {
      const hasL = (window as any).L;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!hasL) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }
    };

    ensureLeaflet().then(() => {
      const L = (window as any).L;
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([10.319, 107.25], 9);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);
      }

      const markerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      points.forEach((p) => {
        if (!markersRef.current[p.id]) {
          const marker = L.marker([p.lat, p.lng], { icon: markerIcon, draggable: true })
            .addTo(mapRef.current)
            .bindPopup(`<div><strong>${p.name}</strong><br/>${p.address}<br/>${p.district}, ${p.city}</div>`);
          // Drag to update position
          marker.on("dragend", () => {
            const newPos = marker.getLatLng();
            if (onPointPositionChange) {
              onPointPositionChange(p.id, newPos.lat, newPos.lng);
            }
          });
          markersRef.current[p.id] = marker;
        } else {
          markersRef.current[p.id].setLatLng([p.lat, p.lng]);
        }
      });

      // Clicking on map moves the currently selected point
      if (selectedPointId && markersRef.current[selectedPointId]) {
        mapRef.current.off("click");
        mapRef.current.on("click", (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          const marker = markersRef.current[selectedPointId];
          if (marker) {
            marker.setLatLng([lat, lng]);
            if (onPointPositionChange) {
              onPointPositionChange(selectedPointId, lat, lng);
            }
          }
        });
      }
    });
  }, [points]);

  useEffect(() => {
    if (!selectedPointId) return;
    const L = (window as any).L;
    if (!L) return;
    const map = mapRef.current;
    const marker = markersRef.current[selectedPointId];
    if (map && marker) {
      const latLng = marker.getLatLng();
      map.setView(latLng, Math.max(map.getZoom(), 16), { animate: true });
      marker.openPopup();
    }
  }, [selectedPointId]);

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Vị trí cửa hàng EV Rental</h2>
      <div ref={mapContainerRef} style={{ width: "100%", height: "70vh", border: "1px solid black" }} />
      {/* <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
        <a href="https://www.openstreetmap.org/?#map=9/10.319/107.250" target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
          Xem Bản đồ Rộng hơn
        </a>
      </div> */}
    </div>
  );
}



