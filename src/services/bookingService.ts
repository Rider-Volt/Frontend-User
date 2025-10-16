import { API_BASE } from "./authService";

export const BOOKING_ENDPOINT = `${API_BASE}/booking`;
const BOOKING_STORAGE_PREFIX = "userBookings";

const buildStorageKey = (userId: number) =>
  `${BOOKING_STORAGE_PREFIX}:${userId}`;

const LEGACY_STORAGE_KEY = "userBookings";

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "DENIED"
  | "COMPLETED"
  | "CANCELLED";

export interface CreateBookingPayload {
  userId: number;
  model: string;
  startTime: string;
  endTime: string;
  token?: string;
}

export interface BookingApiResponse {
  bookingId: number;
  userId: number;
  userName: string;
  vehicleId: number;
  vehicleModel: string;
  vehicleLicensePlate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  bookingType: string;
  isActive?: boolean;
  bookingTime: string;
  message?: string;
  success?: boolean;
}

export interface StoredBooking {
  bookingId: number;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  bookingTime: string;
  vehicle: {
    id?: number;
    model: string;
    name?: string;
    type?: string;
    image?: string;
    licensePlate?: string;
  };
  price?: number;
  deposit?: number;
  totalCharge?: number;
  pickupLocation?: string;
  paymentMethod?: string;
}

function authHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingApiResponse> {
  const { token, ...body } = payload;

  const resp = await fetch(BOOKING_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data.message || "KhĂ´ng thá»ƒ táº¡o Ä‘áº·t xe. Vui lĂ²ng thá»­ láº¡i.");
  }

  return data as BookingApiResponse;
}

function migrateLegacyHistory(userId: number) {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  const newKey = buildStorageKey(userId);

  if (legacy && !localStorage.getItem(newKey)) {
    localStorage.setItem(newKey, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export function appendBookingHistory(userId: number | undefined, entry: StoredBooking) {
  if (!userId) return;

  migrateLegacyHistory(userId);
  const key = buildStorageKey(userId);

  const normalizedEntry: StoredBooking = { ...entry };
  const existing = getBookingHistory(userId);
  const next = [
    ...existing.filter((item) => item.bookingId !== entry.bookingId),
    normalizedEntry,
  ];

  localStorage.setItem(key, JSON.stringify(next));
}

export function getBookingHistory(userId?: number): StoredBooking[] {
  if (!userId) return [];

  migrateLegacyHistory(userId);
  const key = buildStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredBooking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    console.warn("KhĂ´ng thá»ƒ Ä‘á»c lá»‹ch sá»­ booking trong localStorage");
    return [];
  }
}

export function clearBookingHistory(userId?: number) {
  if (!userId) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return;
  }
  localStorage.removeItem(buildStorageKey(userId));
}
export function saveBookingHistory(userId: number | undefined, entries: StoredBooking[]) {
  if (!userId) return;
  migrateLegacyHistory(userId);
  const key = buildStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(entries));
}
