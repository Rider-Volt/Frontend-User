// src/services/stationServices.ts
import { API_BASE } from "./authService";

export interface RentalPoint {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export interface StationModelAvailability {
  modelId: number;
  modelName: string;
  available: boolean;
  totalVehicles: number;
  availableVehicles: number;
}

const STATIONS_BASE = `${API_BASE}/stations`;

// Raw station payload from backend
export interface StationApiResponse {
  id: number;
  name: string;
  address: string;
  staff_id?: number;
}

export interface StationBrief {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
}

// Simple localStorage cache for geocoding results
const GEO_CACHE_PREFIX = "geo_cache_v1:";

function readGeoCache(address: string): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_PREFIX + address);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat: number; lng: number };
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeGeoCache(address: string, coords: { lat: number; lng: number }): void {
  try {
    localStorage.setItem(GEO_CACHE_PREFIX + address, JSON.stringify(coords));
  } catch {}
}

// Geocode a Vietnamese address using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const cached = readGeoCache(address);
  if (cached) return cached;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(
      address
    )}`;
    const resp = await fetch(url, {
      headers: {
        // Identify our app politely to Nominatim
        "Accept": "application/json",
      },
    });
    const data = (await resp.json()) as Array<{ lat: string; lon: string }>;
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const coords = { lat, lng };
        writeGeoCache(address, coords);
        return coords;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Try multiple queries to improve geocoding hit-rate
async function geocodeBestEffort(address: string, district?: string, city?: string): Promise<{ lat: number; lng: number } | null> {
  // 1) Full address
  let coords = await geocodeAddress(address);
  if (coords) return coords;

  // 2) Address + country
  coords = await geocodeAddress(`${address}, Việt Nam`);
  if (coords) return coords;

  // 3) District + City
  if (district && city) {
    coords = await geocodeAddress(`${district}, ${city}, Việt Nam`);
    if (coords) return coords;
  }

  // 4) City only
  if (city) {
    coords = await geocodeAddress(`${city}, Việt Nam`);
    if (coords) return coords;
  }

  return null;
}

// Extract district and city from an address string (best-effort)
function parseDistrictCity(address: string): { district: string; city: string } {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  // Heuristics: last part is city, one before last could be district
  const city = parts[parts.length - 1] || "";
  const district = parts.length >= 2 ? parts[parts.length - 2] : "";
  return { district, city };
}

// Public: list stations without requiring geocoding (for dropdowns)
export async function listStationsBrief(): Promise<StationBrief[]> {
  try {
    const resp = await fetch(STATIONS_BASE, { headers: { "Content-Type": "application/json" } });
    if (!resp.ok) return [];
    const data = (await resp.json()) as StationApiResponse[] | { stations?: StationApiResponse[] };
    const raw: StationApiResponse[] = Array.isArray(data) ? data : data.stations || [];
    return raw.map((s) => {
      const { district, city } = parseDistrictCity(s.address || "");
      return { id: s.id, name: s.name, address: s.address, district, city };
    });
  } catch {
    return [];
  }
}

// Get all stations from API
export const getRentalPoints = async (): Promise<RentalPoint[]> => {
  try {
    const resp = await fetch(STATIONS_BASE, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!resp.ok) {
      // No mock: fail gracefully with empty list
      console.warn("Failed to fetch stations from API", resp.status, resp.statusText);
      return [];
    }

    const data = (await resp.json()) as StationApiResponse[] | { stations?: StationApiResponse[] };
    const raw: StationApiResponse[] = Array.isArray(data) ? data : data.stations || [];

    // Enrich with geocoded coordinates and district/city info
    const enriched = await Promise.all(
      raw.map(async (s): Promise<RentalPoint | null> => {
        const { district, city } = parseDistrictCity(s.address || "");
        const coords = await geocodeBestEffort(s.address || "", district, city);
        if (!coords) {
          console.warn("Geocode failed for station:", s);
          return null; // skip when we truly cannot resolve
        }
        return {
          id: s.id,
          name: s.name,
          address: s.address,
          district,
          city,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
    );

    // Filter out any that failed to geocode
    return enriched.filter((x): x is RentalPoint => x !== null);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
};



// Get station by ID from API
export const getStationById = async (id: number): Promise<RentalPoint | null> => {
  try {
    const resp = await fetch(`${STATIONS_BASE}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!resp.ok) {
      console.warn(`Failed to fetch station ${id}`, resp.status, resp.statusText);
      return null;
    }

    const data = await resp.json();
    return data as RentalPoint;
  } catch (error) {
    console.error(`Error fetching station ${id}:`, error);
    return null;
  }
};

// Get station model availability from API
export const getStationModelAvailability = async (stationId: number): Promise<StationModelAvailability[]> => {
  try {
    const resp = await fetch(`${STATIONS_BASE}/${stationId}/models/availability`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!resp.ok) {
      console.warn(`Failed to fetch model availability for station ${stationId}`);
      return [];
    }

    const data = await resp.json();
    return Array.isArray(data) ? data : data.models || [];
  } catch (error) {
    console.error(`Error fetching model availability for station ${stationId}:`, error);
    return [];
  }
};