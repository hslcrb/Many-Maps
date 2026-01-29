"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { mapLayers, getMapById } from "@/data/mapLayers";
import {
  MapLayerIcon,
  CloseIcon,
  CheckIcon,
  GlobeIcon,
  SatelliteIcon,
  StreetIcon,
  TerrainIcon,
  DarkIcon,
  TransportIcon,
  TopoIcon,
  WatercolorIcon,
  HotIcon,
  LogoIcon,
} from "@/components/Icons";

// Dynamic import for Leaflet (client-side only)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="map-container" style={{ background: "#1a1a2e" }} />,
});

const iconMap = {
  globe: GlobeIcon,
  satellite: SatelliteIcon,
  street: StreetIcon,
  terrain: TerrainIcon,
  dark: DarkIcon,
  transport: TransportIcon,
  topo: TopoIcon,
  watercolor: WatercolorIcon,
  hot: HotIcon,
};

export default function Home() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentMapId, setCurrentMapId] = useState("osm");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved map preference
    const saved = localStorage.getItem("manyMapsCurrentMap");
    if (saved) {
      setCurrentMapId(saved);
    }
  }, []);

  const handleMapChange = (mapId) => {
    setCurrentMapId(mapId);
    localStorage.setItem("manyMapsCurrentMap", mapId);
    // Panel stays open until user closes it
  };

  const currentMap = getMapById(currentMapId);

  if (!mounted) {
    return <div className="map-container" style={{ background: "#1a1a2e" }} />;
  }

  return (
    <>
      {/* Logo */}
      <div className="logo">
        <LogoIcon />
        <span>Many Maps</span>
      </div>

      {/* Map */}
      <MapComponent currentMap={currentMap} />

      {/* Map Toggle Button */}
      <button
        className="map-toggle-btn"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        title="지도 스타일 변경"
      >
        <MapLayerIcon />
      </button>

      {/* Map Selection Panel */}
      {isPanelOpen && (
        <div className="map-panel">
          <div className="panel-header">
            <h2>
              <MapLayerIcon />
              지도 스타일
            </h2>
            <button className="close-btn" onClick={() => setIsPanelOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="map-list">
            {mapLayers.map((map) => {
              const IconComponent = iconMap[map.icon] || GlobeIcon;
              const isActive = currentMapId === map.id;

              return (
                <button
                  key={map.id}
                  className={`map-item ${isActive ? "active" : ""}`}
                  onClick={() => handleMapChange(map.id)}
                >
                  <div
                    className="map-icon"
                    style={{
                      background: `linear-gradient(135deg, ${map.color}22, ${map.color}44)`,
                      color: map.color,
                    }}
                  >
                    <IconComponent />
                  </div>
                  <div className="map-info">
                    <h3>{map.name}</h3>
                    <p>{map.description}</p>
                  </div>
                  <CheckIcon className="check-icon" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
