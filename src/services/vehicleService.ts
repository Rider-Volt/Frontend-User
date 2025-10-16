import { API_BASE } from "@/services/authService";
import { VehicleData } from "@/data/vehicles";

interface BackendVehicle {
  vehicleId: number;
  stationId?: number | null;
  vehicleType?: string;
  model?: string;
  licensePlate?: string;
  batteryLevel?: number;
  status?: string;
  pricePerHour?: number | string | null;
  pricePerDay?: number | string | null;
  isActive?: boolean;
  imageUrl?: string | null;
  stationName?: string | null;
  stationAddress?: string | null;
  stationLatitude?: number | string | null;
  stationLongitude?: number | string | null;
}

const VEHICLE_API = `${API_BASE}/vehicles`;

// In-memory cache with TTL and request de-duplication
type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
let lastController: AbortController | null = null;
// Feature detection flags to avoid repeating unsupported queries
let supportsLimitQuery = true;
let supportsFilterQuery = true;

const DEFAULT_TTL_MS = 60_000; // 60s

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { data: value, expiresAt: Date.now() + ttlMs });
}

function parseNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function fetchJson<T>(url: string, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = cacheGet<T>(url);
  if (cached !== undefined) return cached;

  const running = inflight.get(url) as Promise<T> | undefined;
  if (running) return running;

  try { lastController?.abort(); } catch {}
  lastController = new AbortController();

  const promise = (async () => {
    const response = await fetch(url, { signal: lastController!.signal });
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(`Request failed (${response.status}): ${message}`);
    }
    const json = (await response.json()) as T;
    cacheSet(url, json, ttlMs);
    return json;
  })();

  inflight.set(url, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(url);
  }
}

function toVehicleData(backend: BackendVehicle): VehicleData {
  const model = backend.model?.trim() || backend.licensePlate?.trim() || "Xe điện";
  const name = model;
  const batteryLevel = backend.batteryLevel ?? 0;
  const pricePerHour = parseNumber(backend.pricePerHour);
  const explicitPricePerDay = parseNumber(backend.pricePerDay);
  const pricePerDay =
    explicitPricePerDay > 0
      ? explicitPricePerDay
      : pricePerHour > 0
      ? Math.round(pricePerHour * 24)
      : 0;
  const status = backend.status?.toUpperCase() || "UNKNOWN";
  const available = status === "AVAILABLE" && backend.isActive !== false;

  const imageUrl = backend.imageUrl?.trim();
  const location =
    backend.stationAddress?.trim() ||
    backend.stationName?.trim() ||
    (backend.stationId ? `Trạm #${backend.stationId}` : "Chưa xác định");

  return {
    id: backend.vehicleId,
    name,
    model,
    type: backend.vehicleType || "Xe điện",
    licensePlate: backend.licensePlate,
    batteryLevel,
    range: batteryLevel > 0 ? batteryLevel * 3 : 0,
    pricePerHour,
    pricePerDay,
    location,
    image: imageUrl || undefined,
    imageUrl: imageUrl || undefined,
    available,
    status,
    stationId: backend.stationId ?? null,
    description: `Biển số ${backend.licensePlate || "—"} · ${status}`,
    fullAddress: backend.stationAddress ?? undefined,
  };
}

export async function fetchVehicles(): Promise<VehicleData[]> {
  const vehicles = await fetchJson<BackendVehicle[]>(VEHICLE_API);
  return vehicles.map(toVehicleData);
}

// Try to fetch a limited list from the backend (if supported),
// and fall back to client-side slicing when necessary.
export async function fetchVehiclesLimited(limit: number): Promise<VehicleData[]> {
  let backendList: BackendVehicle[];
  if (supportsLimitQuery) {
    const url = `${VEHICLE_API}?limit=${encodeURIComponent(String(limit))}`;
    try {
      backendList = await fetchJson<BackendVehicle[]>(url);
    } catch {
      supportsLimitQuery = false;
      backendList = await fetchJson<BackendVehicle[]>(VEHICLE_API);
    }
  } else {
    backendList = await fetchJson<BackendVehicle[]>(VEHICLE_API);
  }
  const mapped = backendList.map(toVehicleData);
  return mapped.length > limit ? mapped.slice(0, limit) : mapped;
}

// Prefer server-side filtering; fallback to client-side filter + slice
export async function fetchVehiclesFiltered(params: {
  location?: string;
  type?: string;
  limit?: number;
}): Promise<VehicleData[]> {
  const { location, type, limit } = params;
  const query = new URLSearchParams();
  if (location) query.set("location", location);
  if (type) query.set("type", type);
  if (limit && Number.isFinite(limit)) query.set("limit", String(limit));
  const url = query.toString() ? `${VEHICLE_API}?${query}` : VEHICLE_API;
  // Helper to filter locally with synonyms to be robust when backend ignores filters
  const filterLocal = (list: VehicleData[]): VehicleData[] => {
    let mapped = list;
    if (location) {
      const needle = location.toLowerCase();
      mapped = mapped.filter((v) => (v.location || "").toLowerCase().includes(needle));
    }
    if (type) {
      const t = type.toLowerCase();
      const synonyms = new Set<string>([t]);
      if (t === "e-scooter") {
        ["xe máy điện", "xe may dien", "scooter"].forEach((s) => synonyms.add(s));
      } else if (t === "e-bike") {
        ["xe đạp điện", "xe dap dien", "e-bike", "ebike", "bike"].forEach((s) => synonyms.add(s));
      } else if (t === "e-car") {
        ["ô tô điện", "o to dien", "oto dien", "car", "vinfast", "vf"].forEach((s) => synonyms.add(s));
      }
      mapped = mapped.filter((v) => {
        const vt = (v.type || "").toLowerCase();
        for (const s of synonyms) {
          if (vt.includes(s)) return true;
        }
        return false;
      });
    }
    if (limit && mapped.length > limit) mapped = mapped.slice(0, limit);
    return mapped;
  };
  if (supportsFilterQuery && url !== VEHICLE_API) {
    try {
      const list = await fetchJson<BackendVehicle[]>(url);
      const mapped = list.map(toVehicleData);
      return filterLocal(mapped);
    } catch {
      supportsFilterQuery = false;
      const list = await fetchJson<BackendVehicle[]>(VEHICLE_API);
      const mapped = list.map(toVehicleData);
      return filterLocal(mapped);
    }
  } else {
    const list = await fetchJson<BackendVehicle[]>(VEHICLE_API);
    const mapped = list.map(toVehicleData);
    return filterLocal(mapped);
  }
}

export async function fetchVehicleById(
  vehicleId: number
): Promise<VehicleData | null> {
  const vehicles = await fetchJson<BackendVehicle[]>(`${VEHICLE_API}/${vehicleId}`);
  const target = vehicles[0];
  if (!target) {
    return null;
  }
  return toVehicleData(target);
}

export function clearVehicleServiceCache() {
  cache.clear();
  inflight.clear();
  try { lastController?.abort(); } catch {}
}
