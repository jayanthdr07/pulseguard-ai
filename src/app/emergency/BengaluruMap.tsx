"use client";

// Bengaluru Emergency Map using Leaflet (OpenStreetMap - no API key needed)
// Dynamic import is used to avoid SSR issues with Leaflet

import { useEffect, useRef, useState } from "react";

interface BengaluruMapProps {
  ambulanceLat: number;
  ambulanceLng: number;
  patientLat: number;
  patientLng: number;
  hospitalLat: number;
  hospitalLng: number;
  eta: number;
}

export default function BengaluruMap({
  ambulanceLat, ambulanceLng,
  patientLat, patientLng,
  hospitalLat, hospitalLng,
  eta,
}: BengaluruMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const ambulanceMarkerRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamically import leaflet to avoid SSR
    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [patientLat, patientLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Patient marker
      const patientIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#ff2d55;border:3px solid white;box-shadow:0 0 0 6px rgba(255,45,85,0.3);"></div>`,
        className: "", iconSize: [20, 20], iconAnchor: [10, 10],
      });
      L.marker([patientLat, patientLng], { icon: patientIcon })
        .addTo(map).bindPopup("<b>🔴 Patient Location</b><br>Critical condition detected").openPopup();

      // Hospital marker
      const hospitalIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;border-radius:8px;background:#06d6a0;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;">🏥</div>`,
        className: "", iconSize: [36, 36], iconAnchor: [18, 18],
      });
      L.marker([hospitalLat, hospitalLng], { icon: hospitalIcon })
        .addTo(map).bindPopup("<b>🏥 Apollo Hospitals</b><br>2.3 km · Emergency dept ready");

      // Ambulance marker
      const ambulanceIcon = L.divIcon({
        html: `<div style="width:38px;height:38px;border-radius:50%;background:#4361ee;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;">🚑</div>`,
        className: "", iconSize: [38, 38], iconAnchor: [19, 19],
      });
      const ambulanceMarker = L.marker([ambulanceLat, ambulanceLng], { icon: ambulanceIcon })
        .addTo(map).bindPopup(`<b>🚑 Ambulance PG-117</b><br>ETA: ~${eta} min<br>Driver: Ravi Kumar`);

      L.polyline([[ambulanceLat, ambulanceLng], [patientLat, patientLng]],
        { color: "#4361ee", weight: 3, dashArray: "8 6", opacity: 0.8 }).addTo(map);

      const bounds = L.latLngBounds([patientLat, patientLng], [ambulanceLat, ambulanceLng]);
      map.fitBounds(bounds, { padding: [40, 40] });

      mapInstanceRef.current = map;
      ambulanceMarkerRef.current = ambulanceMarker;
      if (isMounted) setLoaded(true);

      // Animate ambulance
      let step = 0;
      const totalSteps = 60;
      const latDiff = patientLat - ambulanceLat;
      const lngDiff = patientLng - ambulanceLng;
      const anim = setInterval(() => {
        step++;
        if (step >= totalSteps) { clearInterval(anim); return; }
        const progress = step / totalSteps;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ambulanceMarker as any).setLatLng([
          ambulanceLat + latDiff * progress,
          ambulanceLng + lngDiff * progress,
        ]);
      }, 3000);

      // Store anim ID for cleanup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any)._animId = anim;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m = mapInstanceRef.current as any;
        if (m._animId) clearInterval(m._animId);
        m.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        style={{ height: 280, borderRadius: 16, overflow: "hidden" }}
        className="w-full"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: "#0d1117" }}>
          <div className="text-white/40 text-sm animate-pulse">Loading Bengaluru map…</div>
        </div>
      )}
      {/* Live status overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none">
        <div className="glass rounded-xl px-3 py-1.5 text-xs text-white/80 flex items-center gap-2"
          style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}>
          <span className="w-2 h-2 rounded-full bg-[#4361ee] animate-pulse" />
          Unit PG-117 en route
        </div>
        <div className="glass rounded-xl px-3 py-1.5 text-xs font-bold text-[#ffd60a]"
          style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}>
          ETA ~{eta} min
        </div>
      </div>
    </div>
  );
}
