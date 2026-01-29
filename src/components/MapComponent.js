"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import L from "leaflet";
import "leaflet-rotate";

const MapComponent = forwardRef(({ currentMap, overlayMaps = [], overlayMode = false, bearing = 0, onBearingChange }, ref) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const overlayLayersRef = useRef([]);

    useImperativeHandle(ref, () => ({
        getMap: () => mapInstanceRef.current,
        setBearing: (deg) => {
            if (mapInstanceRef.current && mapInstanceRef.current.setBearing) {
                mapInstanceRef.current.setBearing(deg);
            }
        }
    }));

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map with rotation support
        mapInstanceRef.current = L.map(mapRef.current, {
            center: [37.5665, 126.9780], // Seoul
            zoom: 13,
            zoomControl: false,
            preferCanvas: true,
            rotate: true,
            rotateControl: false,
            bearing: bearing,
            touchRotate: true,
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

        // Listen for bearing changes from touch/gesture
        if (mapInstanceRef.current.on) {
            mapInstanceRef.current.on('rotate', (e) => {
                if (onBearingChange && e.bearing !== undefined) {
                    onBearingChange(e.bearing);
                }
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update bearing when prop changes
    useEffect(() => {
        if (mapInstanceRef.current && mapInstanceRef.current.setBearing) {
            mapInstanceRef.current.setBearing(bearing);
        }
    }, [bearing]);

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
            tileLayerRef.current = L.tileLayer(currentMap.url, {
                attribution: currentMap.attribution,
                maxZoom: currentMap.maxZoom || 19,
                subdomains: currentMap.subdomains || "abc",
            }).addTo(mapInstanceRef.current);
        }
    }, [currentMap, overlayMode, overlayMaps]);

    return (
        <div
            ref={mapRef}
            className="map-container"
        />
    );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
