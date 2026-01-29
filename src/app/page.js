"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { mapLayers, getMapById } from "@/data/mapLayers";
import {
  MapLayerIcon,
  CloseIcon,
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
  OverlayIcon,
  InfoIcon,
  CompassIcon,
  RotateLeftIcon,
  RotateRightIcon,
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
  const [overlayMode, setOverlayMode] = useState(false);
  const [selectedOverlays, setSelectedOverlays] = useState([]);
  const [bearing, setBearing] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, bearing: 0 });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("manyMapsCurrentMap");
    if (saved) {
      setCurrentMapId(saved);
    }
    const savedOverlay = localStorage.getItem("manyMapsOverlayMode");
    if (savedOverlay === "true") {
      setOverlayMode(true);
      const savedOverlays = localStorage.getItem("manyMapsOverlays");
      if (savedOverlays) {
        setSelectedOverlays(JSON.parse(savedOverlays));
      }
    }
    const savedBearing = localStorage.getItem("manyMapsBearing");
    if (savedBearing) {
      setBearing(parseFloat(savedBearing));
    }
  }, []);

  const handleMapChange = (mapId) => {
    if (overlayMode) {
      setSelectedOverlays(prev => {
        const newOverlays = prev.includes(mapId)
          ? prev.filter(id => id !== mapId)
          : [...prev, mapId];
        localStorage.setItem("manyMapsOverlays", JSON.stringify(newOverlays));
        return newOverlays;
      });
    } else {
      setCurrentMapId(mapId);
      localStorage.setItem("manyMapsCurrentMap", mapId);
    }
  };

  const toggleOverlayMode = () => {
    const newMode = !overlayMode;
    setOverlayMode(newMode);
    localStorage.setItem("manyMapsOverlayMode", newMode.toString());
    if (newMode && selectedOverlays.length === 0) {
      setSelectedOverlays([currentMapId]);
      localStorage.setItem("manyMapsOverlays", JSON.stringify([currentMapId]));
    }
  };

  const resetBearing = () => {
    setBearing(0);
    localStorage.setItem("manyMapsBearing", "0");
  };

  const rotateBearing = (delta) => {
    setBearing(prev => {
      const newBearing = (prev + delta + 360) % 360;
      localStorage.setItem("manyMapsBearing", newBearing.toString());
      return newBearing;
    });
  };

  // Compass drag rotation
  const handleCompassMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      bearing: bearing,
    };
  }, [bearing]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const newBearing = (dragStartRef.current.bearing + deltaX * 0.5 + 360) % 360;
    setBearing(newBearing);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem("manyMapsBearing", bearing.toString());
    }
  }, [isDragging, bearing]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const currentMap = getMapById(currentMapId);
  const overlayMapsData = selectedOverlays.map(id => getMapById(id)).filter(Boolean);

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

      {/* Compass - 우측 상단 */}
      <div className="compass-container">
        <button
          className="rotate-btn rotate-left"
          onClick={() => rotateBearing(-15)}
          title="15° 왼쪽 회전"
        >
          <RotateLeftIcon />
        </button>
        <button
          className={`compass-btn ${bearing !== 0 ? 'rotated' : ''}`}
          onClick={resetBearing}
          onMouseDown={handleCompassMouseDown}
          title={bearing !== 0 ? `${bearing.toFixed(1)}° - 클릭하여 북쪽으로 리셋` : "드래그하여 회전"}
        >
          <CompassIcon rotation={bearing} />
          {bearing !== 0 && (
            <span className="bearing-indicator">{Math.round(bearing)}°</span>
          )}
        </button>
        <button
          className="rotate-btn rotate-right"
          onClick={() => rotateBearing(15)}
          title="15° 오른쪽 회전"
        >
          <RotateRightIcon />
        </button>
      </div>

      {/* Map */}
      <MapComponent
        currentMap={currentMap}
        overlayMode={overlayMode}
        overlayMaps={overlayMapsData}
        bearing={bearing}
      />

      {/* Control Buttons - 우측 하단 */}
      <div className="control-buttons">
        <button
          className={`control-btn overlay-btn ${overlayMode ? "active" : ""}`}
          onClick={toggleOverlayMode}
          title={overlayMode ? "일반 모드로 전환" : "겹쳐보기 모드"}
        >
          <OverlayIcon />
        </button>
        <button
          className="control-btn map-toggle-btn"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          title="지도 스타일 변경"
        >
          <MapLayerIcon />
        </button>
      </div>

      {/* Map Selection Panel */}
      {isPanelOpen && (
        <div className="map-panel">
          <div className="panel-header">
            <h2>
              <MapLayerIcon />
              {overlayMode ? "겹칠 지도 선택" : "지도 스타일"}
              {overlayMode && <span className="overlay-badge">{selectedOverlays.length}개</span>}
            </h2>
            <button className="close-btn" onClick={() => setIsPanelOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          {overlayMode && (
            <div className="overlay-info">
              여러 지도를 선택하면 겹쳐서 표시됩니다
            </div>
          )}

          <div className="map-list">
            {mapLayers.map((map) => {
              const IconComponent = iconMap[map.icon] || GlobeIcon;
              const isActive = overlayMode
                ? selectedOverlays.includes(map.id)
                : currentMapId === map.id;

              return (
                <div key={map.id} className="map-item-wrapper">
                  <button
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
                    </div>
                  </button>
                  <div className="info-btn" title={`${map.desc}\n${map.license}`}>
                    <InfoIcon />
                    <div className="tooltip">
                      <p className="tooltip-desc">{map.desc}</p>
                      <p className="tooltip-license">{map.license}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
