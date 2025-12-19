import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { LoadRing } from './LoadRing';

// GeoJSON simplificat pentru harta lumii
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Coordonate Hardcoded pentru orasele tale
const cityCoords: Record<string, [number, number]> = {
    'bucharest': [26.1025, 44.4268],
    'budapest': [19.0402, 47.4979],
    'belgrade': [20.4489, 44.7866],
    'palermo': [13.3615, 38.1157],
    'frankfurt': [8.6821, 50.1109],
    'london': [-0.1276, 51.5072],
    'new york': [-74.0060, 40.7128],
    'amsterdam': [4.9041, 52.3676],
    'paris': [2.3522, 48.8566],
    'milan': [9.1900, 45.4642],
    'vienna': [16.3738, 48.2082],
    'berlin': [13.4050, 52.5200],
    'madrid': [-3.7038, 40.4168],
    'sofia': [23.3219, 42.6977],
    'warsaw': [21.0122, 52.2297],
    'prague': [14.4378, 50.0755],
    'athens': [23.7275, 37.9838],
    'istanbul': [28.9784, 41.0082]
};

export const ServerMap = ({ servers, onSelect, selectedId }: any) => {

    // Grupam serverele dupa oras
    const mapMarkers = useMemo(() => {
        const markers: any[] = [];
        servers.forEach((s: any) => {
            const cityKey = s.prettyCity.toLowerCase();
            if (cityCoords[cityKey]) {
                markers.push({
                    name: s.prettyCity,
                    coordinates: cityCoords[cityKey],
                    server: s // Legatura catre obiectul server
                });
            }
        });
        return markers;
    }, [servers]);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-xl bg-[#09090b]">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 100, center: [15, 50] }} // Focus Europa
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#1f2937"
                                stroke="#374151"
                                strokeWidth={0.5}
                                style={{
                                    default: { fill: "#1f2937", outline: "none" },
                                    hover: { fill: "#374151", outline: "none" },
                                    pressed: { fill: "#111827", outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {mapMarkers.map(({ name, coordinates, server }) => (
                    <Marker key={server.id} coordinates={coordinates} onClick={() => onSelect(server)}>
                        <g
                            className="cursor-pointer group"
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={`${server.name} | Load: ${server.load}%`}
                        >
                            {/* Pulse Effect pentru serverul selectat */}
                            {selectedId === server.id && (
                                <circle r={12} fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
                            )}

                            {/* Marker Core */}
                            <circle r={4} fill={selectedId === server.id ? "#10b981" : "#8b5cf6"} stroke="#fff" strokeWidth={1} />

                            {/* Hover Load Ring (Custom Mini) */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity" transform="translate(-10, -30)">
                                <rect width="20" height="20" fill="#000" rx="4" opacity="0.8" />
                                <text x="10" y="14" fontSize="8" fill="white" textAnchor="middle">{server.load}</text>
                            </g>
                        </g>
                    </Marker>
                ))}
            </ComposableMap>

            {/* Legenda */}
            <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-xs text-gray-400 pointer-events-none">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Selected</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Available</div>
            </div>
        </div>
    );
};