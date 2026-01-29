"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

const MapComponent = ({ currentMap }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, {
            center: [37.5665, 126.9780], // Seoul
            zoom: 13,
            zoomControl: true,
            preferCanvas: true,
        });

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
        if (!mapInstanceRef.current || !tileLayerRef.current) return;

        // Update tile layer when map changes
        mapInstanceRef.current.removeLayer(tileLayerRef.current);

        tileLayerRef.current = L.tileLayer(currentMap.url, {
            attribution: currentMap.attribution,
            maxZoom: currentMap.maxZoom || 19,
            subdomains: currentMap.subdomains || "abc",
        }).addTo(mapInstanceRef.current);
    }, [currentMap]);

    return <div ref={mapRef} className="map-container" />;
};

export default MapComponent;
