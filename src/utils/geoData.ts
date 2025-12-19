// Baza de date extinsa pentru locatii VPN
export const countryMap: Record<string, string> = {
    // Europe
    'al': 'Albania', 'at': 'Austria', 'be': 'Belgium', 'bg': 'Bulgaria', 'hr': 'Croatia',
    'cy': 'Cyprus', 'cz': 'Czechia', 'dk': 'Denmark', 'ee': 'Estonia', 'fi': 'Finland',
    'fr': 'France', 'de': 'Germany', 'gr': 'Greece', 'hu': 'Hungary', 'is': 'Iceland',
    'ie': 'Ireland', 'it': 'Italy', 'lv': 'Latvia', 'lt': 'Lithuania', 'lu': 'Luxembourg',
    'md': 'Moldova', 'nl': 'Netherlands', 'no': 'Norway', 'pl': 'Poland', 'pt': 'Portugal',
    'ro': 'Romania', 'rs': 'Serbia', 'sk': 'Slovakia', 'si': 'Slovenia', 'es': 'Spain',
    'se': 'Sweden', 'ch': 'Switzerland', 'tr': 'Turkey', 'ua': 'Ukraine', 'uk': 'United Kingdom', 'gb': 'United Kingdom',
    // Americas
    'ar': 'Argentina', 'br': 'Brazil', 'ca': 'Canada', 'cl': 'Chile', 'co': 'Colombia',
    'cr': 'Costa Rica', 'mx': 'Mexico', 'pe': 'Peru', 'us': 'United States',
    // Asia/Pacific
    'au': 'Australia', 'hk': 'Hong Kong', 'in': 'India', 'id': 'Indonesia', 'jp': 'Japan',
    'my': 'Malaysia', 'nz': 'New Zealand', 'sg': 'Singapore', 'kr': 'South Korea', 'th': 'Thailand',
    'vn': 'Vietnam', 'ae': 'UAE', 'il': 'Israel', 'za': 'South Africa'
};

export const cityCoords: Record<string, [number, number]> = {
    // Romania & Neighbors
    'buh': [44.4268, 26.1025], 'buc': [44.4268, 26.1025], // Bucharest
    'beg': [44.7866, 20.4489], // Belgrade
    'sof': [42.6977, 23.3219], // Sofia
    'bud': [47.4979, 19.0402], // Budapest
    'vie': [48.2082, 16.3738], // Vienna
    'bts': [48.1486, 17.1077], // Bratislava
    'prg': [50.0755, 14.4378], // Prague
    'waw': [52.2297, 21.0122], // Warsaw
    'kiv': [50.4501, 30.5234], // Kyiv
    'ch': [47.0105, 28.8638],  // Chisinau

    // Western Europe
    'lon': [51.5072, -0.1276], 'man': [53.4808, -2.2426], // UK
    'ams': [52.3676, 4.9041],  // Amsterdam
    'par': [48.8566, 2.3522], 'mrs': [43.2965, 5.3698], // France
    'fra': [50.1109, 8.6821], 'ber': [52.5200, 13.4050], 'dus': [51.2277, 6.7735], 'mun': [48.1351, 11.5820], // Germany
    'mil': [45.4642, 9.1900], 'rom': [41.9028, 12.4964], 'pmo': [38.1157, 13.3615], // Italy
    'mad': [40.4168, -3.7038], 'bcn': [41.3851, 2.1734], // Spain
    'lis': [38.7223, -9.1393], // Lisbon
    'zrh': [47.3769, 8.5417],  // Zurich
    'sto': [59.3293, 18.0686], // Stockholm
    'osl': [59.9139, 10.7522], // Oslo
    'cph': [55.6761, 12.5683], // Copenhagen
    'hel': [60.1699, 24.9384], // Helsinki
    'bru': [50.8503, 4.3517],  // Brussels
    'dub': [53.3498, -6.2603], // Dublin

    // USA & Canada
    'nyc': [40.7128, -74.0060], 'nj': [40.0583, -74.4057],
    'lax': [34.0522, -118.2437], 'sfo': [37.7749, -122.4194], 'sea': [47.6062, -122.3321],
    'chi': [41.8781, -87.6298], 'dal': [32.7767, -96.7970], 'mia': [25.7617, -80.1918],
    'atl': [33.7490, -84.3880], 'den': [39.7392, -104.9903], 'phx': [33.4484, -112.0740],
    'tor': [43.6532, -79.3832], 'yvr': [49.2827, -123.1207], 'mtl': [45.5017, -73.5673],

    // Rest of World
    'tok': [35.6762, 139.6503], 'tyo': [35.6762, 139.6503], // Tokyo
    'seo': [37.5665, 126.9780], // Seoul
    'sg': [1.3521, 103.8198], 'sgp': [1.3521, 103.8198], // Singapore
    'hk': [22.3193, 114.1694], // Hong Kong
    'syd': [-33.8688, 151.2093], 'mel': [-37.8136, 144.9631], // Australia
    'ak': [-36.8485, 174.7633], // Auckland
    'dxb': [25.276987, 55.296249], // Dubai
    'tlv': [32.0853, 34.7818], // Tel Aviv
    'ist': [41.0082, 28.9784], // Istanbul
    'jnb': [-26.2041, 28.0473], // Johannesburg
    'sao': [-23.5505, -46.6333], // Sao Paulo
    'bog': [4.7110, -74.0721], // Bogota
    'mex': [19.4326, -99.1332]  // Mexico City
};

// Functie smart pentru a gasi orasul in numele fisierului
export const detectCity = (filename: string): { city: string, country: string, code: string } => {
    const parts = filename.toLowerCase().split(/[-_]/);

    // 1. Cautam codul de tara
    let countryCode = 'unknown';
    let countryName = 'Unknown';

    for (const p of parts) {
        if (countryMap[p]) {
            countryCode = p;
            countryName = countryMap[p];
            break;
        }
    }

    // 2. Cautam orasul
    for (const p of parts) {
        if (cityCoords[p]) {
            // Mapping invers pentru a gasi numele frumos daca avem dictionar, altfel uppercase
            const prettyCity = p.toUpperCase();
            return { city: prettyCity, country: countryName, code: p };
        }
    }

    return { city: 'Unknown', country: countryName, code: 'unknown' };
};