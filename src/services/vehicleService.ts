import { API_BASE } from "@/services/authService";
import { VehicleData } from "@/data/vehicles";

// Backend Model response used for displaying vehicles to users
interface BackendModel {
  id: number;
  name: string;
  pricePerDay?: number | string | null;
  photoUrl?: string | null;
  type?: string | null;
}

// Public listing now uses Model API
const MODEL_API = `${API_BASE}/models`;

// In-memory cache with TTL and request de-duplication
type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
let lastController: AbortController | null = null;

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
  if (typeof value === "number" && Number.isFinite(value)) return value;
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

  try {
    lastController?.abort();
  } catch {}
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

function toVehicleDataFromModel(backend: BackendModel): VehicleData {
  const name = backend.name?.trim() || "Mẫu xe";
  const model = name;
  const pricePerDay = parseNumber(backend.pricePerDay);
  const type = backend.type || "Xe điện";
  const imageUrl = backend.photoUrl?.trim() || undefined;
  const batteryLevel = 0; // Model API không cung cấp
  return {
    id: backend.id,
    name,
    model,
    type,
    batteryLevel,
    range: 0,
    pricePerHour: undefined,
    pricePerDay,
    location: "",
    image: imageUrl,
    imageUrl,
    available: true,
    status: "AVAILABLE",
    stationId: null,
    description: undefined,
    fullAddress: undefined,
  };
}

export async function fetchVehicles(): Promise<VehicleData[]> {
  const models = await fetchJson<BackendModel[]>(MODEL_API);
  return models.map(toVehicleDataFromModel);
}

export async function fetchVehiclesLimited(limit: number): Promise<VehicleData[]> {
  const backendList = await fetchJson<BackendModel[]>(MODEL_API);
  const mapped = backendList.map(toVehicleDataFromModel);
  return mapped.length > limit ? mapped.slice(0, limit) : mapped;
}

export async function fetchVehiclesFiltered(params: {
  location?: string;
  type?: string;
  limit?: number;
}): Promise<VehicleData[]> {
  const { type, limit } = params;
  const list = await fetchJson<BackendModel[]>(MODEL_API);
  let mapped = list.map(toVehicleDataFromModel);
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
      for (const s of synonyms) if (vt.includes(s)) return true;
      return false;
    });
  }
  if (limit && mapped.length > limit) mapped = mapped.slice(0, limit);
  return mapped;
}

export async function fetchVehicleById(id: number): Promise<VehicleData | null> {
  const model = await fetchJson<BackendModel>(`${MODEL_API}/${id}`);
  if (!model || typeof model.id !== "number") return null;
  return toVehicleDataFromModel(model);
}

export function clearVehicleServiceCache() {
  cache.clear();
  inflight.clear();
  try {
    lastController?.abort();
  } catch {}
}
