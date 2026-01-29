"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const MapComponent = ({ currentMap, overlayMaps = [], overlayMode = false }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const overlayLayersRef = useRef([]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, {
            center: [37.5665, 126.9780], // Seoul
            zoom: 13,
            zoomControl: false, // 커스텀 위치를 위해 비활성화
            preferCanvas: true,
        });

        // Add zoom control to bottom-left
        L.control.zoom({
            position: 'bottomleft'
        }).addTo(mapInstanceRef.current);

        // Add initial tile layer
        tileLayerRef.current = L.tileLayer(currentMap.url, {
            attribution: currentMap.attribution,
            maxZoom: currentMap.maxZoom || 19,
            subdomains: currentMap.subdomains || "abc",
        }).addTo(mapInstanceRef.current);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing layers
        if (tileLayerRef.current) {
            mapInstanceRef.current.removeLayer(tileLayerRef.current);
        }
        overlayLayersRef.current.forEach(layer => {
            if (layer) mapInstanceRef.current.removeLayer(layer);
        });
        overlayLayersRef.current = [];

        if (overlayMode && overlayMaps.length > 0) {
            // Overlay mode: stack multiple maps with opacity
            const opacityStep = 1 / overlayMaps.length;

            overlayMaps.forEach((map, index) => {
                const layer = L.tileLayer(map.url, {
                    attribution: map.attribution,
                    maxZoom: map.maxZoom || 19,
                    subdomains: map.subdomains || "abc",
                    opacity: 0.3 + (index * opacityStep * 0.5),
                }).addTo(mapInstanceRef.current);
                overlayLayersRef.current.push(layer);
            });

            tileLayerRef.current = null;
        } else {
            // Normal mode: single map
            tileLayerRef.current = L.tileLayer(currentMap.url, {
                attribution: currentMap.attribution,
                maxZoom: currentMap.maxZoom || 19,
                subdomains: currentMap.subdomains || "abc",
            }).addTo(mapInstanceRef.current);
        }
    }, [currentMap, overlayMode, overlayMaps]);

    return <div ref={mapRef} className="map-container" />;
};

export default MapComponent;
