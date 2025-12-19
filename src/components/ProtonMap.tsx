import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cityCoords } from '../utils/geoData';

// Custom Marker Icon (Circle with count)
const createGroupIcon = (count: number, isSelected: boolean) => {
    const color = isSelected ? '#10b981' : '#8b5cf6';
    return L.divIcon({
        className: 'custom-group-marker',
        html: `<div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
            font-weight: bold;
            font-size: 10px;
            box-shadow: 0 0 10px ${color};
            border: 2px solid white;
        ">${count}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
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
            const code = s.cityCode; // Acum avem codul orasului in obiect
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
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <MapUpdater center={activeGroup ? activeGroup.coords : null} />

                {cityGroups.map((group) => (
                    <Marker
                        key={group.code}
                        position={group.coords}
                        icon={createGroupIcon(group.servers.length, group.isSelected)}
                        eventHandlers={{
                            click: () => onCitySelect(group), // Deschidem drawer-ul
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};