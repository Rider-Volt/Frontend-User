import type {
  BillingStatus,
  RenterBillingResponse,
} from "./renterBillingService";

const BOOKING_STORAGE_PREFIX = "userBookings";
const LEGACY_STORAGE_KEY = "userBookings";

const buildStorageKey = (userId: number) =>
  `${BOOKING_STORAGE_PREFIX}:${userId}`;

export type StoredBooking = RenterBillingResponse & {
  /**
   * Legacy alias for id used by old UI code.
   */
  bookingId?: number;
  /**
   * Legacy date fields for backward compatibility.
   * Maps from plannedStartDate/plannedEndDate.
   */
  startDay?: string;
  endDay?: string;
  /**
   * UI-only enrichment captured at booking time.
   */
  localVehicleName?: string;
  localVehicleImage?: string;
  totalCharge?: number;
  pickupLocation?: string;
  paymentMethod?: string;
  // deposit field removed
};

function migrateLegacyHistory(userId: number) {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  const newKey = buildStorageKey(userId);

  if (legacy && !localStorage.getItem(newKey)) {
    localStorage.setItem(newKey, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

function normalizeStored(entry: StoredBooking): StoredBooking {
  const bookingId = entry.id ?? entry.bookingId;
  if (bookingId === undefined || bookingId === null) {
    throw new Error("Thiếu mã billing khi lưu lịch sử đặt xe");
  }
  const legacy = entry as StoredBooking & {
    startTime?: string;
    endTime?: string;
    totalPrice?: number;
    price?: number;
  };
  const statusCandidate = entry.status as BillingStatus | string | undefined;
  const statusMap: Record<string, BillingStatus> = {
    WAITING: "PENDING", // Legacy mapping
    PAYED: "PAID", // Legacy mapping
    RENTING: "RENTING", // API status
    DONE: "DONE", // API status
    CANCELLED: "CANCELED", // Legacy mapping
    PENDING: "PENDING",
    LOCKED: "LOCKED",
    PAID: "PAID",
    IN_PROGRESS: "RENTING", // Map old internal value to API value
    RETURNED: "DONE", // Map old internal value to API value
    CANCELED: "CANCELED",
    EXPIRED: "EXPIRED",
  };
  const normalStatus =
    typeof statusCandidate === "string" &&
    (BookingStatuses as readonly string[]).includes(statusCandidate)
      ? (statusCandidate as BillingStatus)
      : statusMap[String(statusCandidate).toUpperCase()] || "PENDING";
  // Support both old format (startDay/endDay) and new format (plannedStartDate/plannedEndDate)
  const startDay = (entry as any).startDay ?? (entry as any).plannedStartDate ?? legacy.startTime ?? "";
  const endDay = (entry as any).endDay ?? (entry as any).plannedEndDate ?? legacy.endTime ?? "";
  const totalCost =
    entry.totalCost ?? legacy.totalPrice ?? legacy.price ?? undefined;
  return {
    ...entry,
    id: bookingId,
    bookingId,
    status: normalStatus,
    startDay,
    endDay,
    totalCost,
  };
}

export function appendBookingHistory(
  userId: number | undefined,
  entry: StoredBooking
) {
  if (!userId) return;

  migrateLegacyHistory(userId);
  const key = buildStorageKey(userId);

  const normalizedEntry = normalizeStored(entry);
  const existing = getBookingHistory(userId);
  const next = [
    ...existing.filter((item) => (item.id ?? item.bookingId) !== normalizedEntry.id),
    normalizedEntry,
  ];

  localStorage.setItem(key, JSON.stringify(next));
}

export function getBookingHistory(_userId?: number): StoredBooking[] {
  // Always return an empty array to prevent showing any booking history
  return [];
}

export function saveBookingHistory(
  userId: number | undefined,
  entries: StoredBooking[]
) {
  if (!userId) {
    console.warn("Cannot save booking history: No user ID provided");
    return;
  }

  const key = buildStorageKey(userId);

  try {
    // Ensure all entries are valid and have the correct user ID
    const validEntries = entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        ...normalizeStored(entry),
        // Clear any potentially sensitive or unnecessary data
        paymentMethod: undefined,
        creditCardInfo: undefined,
      }));

    localStorage.setItem(key, JSON.stringify(validEntries));
  } catch (error) {
    console.error("Failed to save booking history:", error);
    // Clear corrupted data to prevent future issues
    localStorage.removeItem(key);
  }
}

export function clearBookingHistory(userId?: number) {
  if (!userId) {
    console.warn("Cannot clear booking history: No user ID provided");
    return;
  }

  const key = buildStorageKey(userId);
  try {
    localStorage.removeItem(key);
    console.log(`Cleared booking history for user ${userId}`);
  } catch (error) {
    console.error(`Failed to clear booking history for user ${userId}:`, error);
  }
}

export const BookingStatuses: BillingStatus[] = [
  "PENDING",
  "LOCKED",
  "PAID",
  "RENTING",
  "DONE",
  "CANCELED",
  "EXPIRED",
];
