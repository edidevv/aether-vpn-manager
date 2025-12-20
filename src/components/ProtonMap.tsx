import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cityCoords } from '../utils/geoData';

// Custom Marker Icon - MULT MAI MIC SI DISCRET
const createGroupIcon = (count: number, isSelected: boolean) => {
    const color = isSelected ? '#10b981' : '#8b5cf6';
    // Dimensiune redusa: 14px (era 24px)
    const size = 14;

    return L.divIcon({
        className: 'custom-group-marker',
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
            font-weight: 800;
            font-size: 8px; /* Font mic pt numar */
            box-shadow: 0 0 8px ${color}; /* Glow mai mic */
            border: 1.5px solid white;
        ">${count > 9 ? '+' : count}</div>`, // Daca sunt >9 servere punem +, altfel numarul
        iconSize: [size, size],
        iconAnchor: [size/2, size/2] // Centram perfect
    });
};

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    if (center) map.flyTo(center, 5, { duration: 1.5 });
    return null;
};

export const ProtonMap = ({ servers, selectedServerId, onCitySelect }: any) => {

    // Grupam serverele pe orase
    const cityGroups = useMemo(() => {
        const groups: Record<string, any[]> = {};

        servers.forEach((s: any) => {
            const code = s.cityCode;
            if (code && cityCoords[code]) {
                if (!groups[code]) groups[code] = [];
                groups[code].push(s);
            }
        });

        return Object.entries(groups).map(([code, serverList]) => ({
            code,
            coords: cityCoords[code],
            name: serverList[0].prettyCity,
            country: serverList[0].prettyCountry,
            servers: serverList,
            isSelected: serverList.some((s:any) => s.id === selectedServerId)
        }));
    }, [servers, selectedServerId]);

    const activeGroup = cityGroups.find(g => g.isSelected);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-xl border border-white/10 bg-[#09090b]">
            <MapContainer
                center={[48, 15]}
                zoom={4}
                minZoom={3}
                style={{ height: '100%', width: '100%', background: '#09090b' }}
                zoomControl={false}
                attributionControl={false}
            >
                {/* Harta Dark Matter */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                <MapUpdater center={activeGroup ? activeGroup.coords : null} />

                {cityGroups.map((group) => (
                    <Marker
                        key={group.code}
                        position={group.coords}
                        icon={createGroupIcon(group.servers.length, group.isSelected)}
                        eventHandlers={{
                            click: () => onCitySelect(group),
                        }}
                    />
                ))}
            </MapContainer>
        </div>
    );
};
