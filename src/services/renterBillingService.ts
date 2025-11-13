import { API_BASE, authHeaders, getAuthToken } from "./authService";
import {
  IdentityAsset,
  IdentitySet,
  IdentityStatus,
  IdentityAssetType,
} from "@/types/identity";

const BASE = `${API_BASE}/renter/billings`;
const IDENTITY_BASE = `${API_BASE}/renter/identity-sets`;

// Retry mechanism cho các API calls quan trọng
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      lastResponse = response;
      
      if (response.ok) return response;
      
      // Retry cho server errors (5xx) hoặc network errors
      if (response.status >= 500 || response.status === 0) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        if (i < maxRetries - 1) {
          console.warn(`API request failed (attempt ${i + 1}/${maxRetries}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          continue;
        }
      }
      
      return response; // Return response for client errors (4xx)
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        console.warn(`Network error (attempt ${i + 1}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // Return the last response if we got one, otherwise throw
  if (lastResponse) return lastResponse;
  throw lastError || new Error('Request failed after retries');
}

function requireToken(): string {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Ban can dang nhap de thao tac voi hoa don");
  }
  return token;
}

export type BillingStatus =
  | "PENDING"
  | "LOCKED"
  | "PAID"
  | "RENTING"
  | "DONE"
  | "CANCELED"
  | "EXPIRED";

export interface CreateBillingRequest {
  stationId: number;
  modelId: number;
  plannedStartDate: string; 
  plannedEndDate: string;   
}

export interface RenterBillingResponse {
  id: number;
  renterName: string;
  vehicleLicensePlate?: string | null;
  vehicleId?: number | null;
  vehicleModel: string;
  vehiclePhotoUrl?: string | null;
  modelId: number;
  stationId: number;
  stationName: string;
  rentedDay: number;
  bookingTime: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualPickupAt?: string | null;
  actualReturnAt?: string | null;
  preImage?: string | null;
  preImages?: string[] | null;
  finalImage?: string | null;
  finalImages?: string[] | null;
  contractBeforeImage?: string | null;
  contractAfterImage?: string | null;
  status: BillingStatus;
  totalCost?: number | null;
  note?: string | null;
  lockExpiredAt?: string | null;
  paymentExpiredAt?: string | null;
  currentOrderCode?: number | null;
  // Legacy field for backward compatibility
  vehicleCode?: string | null;
  paymentInfo?: {
    paymentLinkId?: string;
    orderCode?: number;
    amount?: number;
    description?: string;
    status?: string;
    checkoutUrl?: string;
    qrCode?: string;
    currency?: string;
    expiredAt?: string;
  } | null;
}

export async function createBilling(
  req: CreateBillingRequest
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const resp = await fetchWithRetry(BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(req),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (resp.status === 409
        ? "Khong co xe AVAILABLE cho station/model da chon"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
  // Handle case-insensitive API response (totalcost vs totalCost)
  const response: any = data;
  if (response.totalcost != null && response.totalCost == null) {
    response.totalCost = response.totalcost;
  }
  return response as RenterBillingResponse;
}

export async function listMyBillings(
  status?: BillingStatus,
  options?: { 
    includeHistory?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<RenterBillingResponse[]> {
  const token = requireToken();
  const params = new URLSearchParams();
  
  if (status) params.append('status', status);
  if (options?.includeHistory) params.append('includeHistory', 'true');
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  
  const url = params.toString() ? `${BASE}?${params}` : BASE;
  const resp = await fetchWithRetry(url, {
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => []);
  
  if (!resp.ok) {
    // Graceful handling for 500 errors - return empty array instead of throwing
    if (resp.status === 500) {
      console.warn('Backend returned 500 error, returning empty array');
      return [];
    }
    
    // Handle auth errors
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    
    throw new Error(data?.message || resp.statusText);
  }
  
  return data as RenterBillingResponse[];
}

export async function getBillingDetail(
  id: number
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const resp = await fetch(`${BASE}/${id}`, {
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.message || resp.statusText);
  return data as RenterBillingResponse;
}

export async function getHistory(): Promise<RenterBillingResponse[]> {
  const token = requireToken();
  const resp = await fetch(`${BASE}/history`, {
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => []);
  if (!resp.ok) throw new Error(data?.message || resp.statusText);
  return data as RenterBillingResponse[];
}

export async function requestCheckIn(
  id: number,
  preImage?: string
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const body = preImage ? { preImage } : {};
  const resp = await fetch(`${BASE}/${id}/check-in`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Hoa don phai o trang thai PAYED de yeu cau check-in"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
  return data as RenterBillingResponse;
}

export async function requestCheckOut(
  id: number,
  finalImage: string
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const resp = await fetch(`${BASE}/${id}/check-out`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ finalImage }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Hoa don phai o trang thai RENTING de yeu cau tra xe"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
  return data as RenterBillingResponse;
}

export async function cancelBilling(
  id: number
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const resp = await fetch(`${BASE}/${id}/cancel`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Không thể hủy hóa đơn ở trạng thái hiện tại"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
  return data as RenterBillingResponse;
}

// PayOS webhook interface
export interface PayOSWebhookPayload {
  [key: string]: any;
}

export async function payOSWebhook(
  payload: PayOSWebhookPayload
): Promise<Record<string, never>> {
  const resp = await fetchWithRetry(`${API_BASE}/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
  const data = await resp.json().catch(() => ({}));
  
  if (!resp.ok) {
    const msg =
      data?.message || resp.statusText || "Webhook processing failed";
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
  
  return (data || {}) as Record<string, never>;
}

function normalizeIdentityAsset(raw: any): IdentityAsset {
  return {
    id: typeof raw?.id === "number" ? raw.id : undefined,
    type: typeof raw?.type === "string" ? raw.type : undefined,
    url: typeof raw?.url === "string" ? raw.url : undefined,
    note: typeof raw?.note === "string" ? raw.note : null,
    takenAt: typeof raw?.takenAt === "string" ? raw.takenAt : null,
    takenBy:
      typeof raw?.takenBy === "number"
        ? raw.takenBy
        : typeof raw?.takenBy === "string"
        ? Number(raw.takenBy)
        : null,
  };
}

function normalizeIdentitySet(raw: any): IdentitySet {
  return {
    id: typeof raw?.id === "number" ? raw.id : Number(raw?.id) || 0,
    cccdNumber: typeof raw?.cccdNumber === "string" ? raw.cccdNumber : null,
    gplxNumber: typeof raw?.gplxNumber === "string" ? raw.gplxNumber : null,
    note: typeof raw?.note === "string" ? raw.note : null,
    status: typeof raw?.status === "string" ? raw.status : undefined,
    reviewNote: typeof raw?.reviewNote === "string" ? raw.reviewNote : null,
    reviewedBy:
      typeof raw?.reviewedBy === "number"
        ? raw.reviewedBy
        : typeof raw?.reviewedBy === "string"
        ? Number(raw.reviewedBy)
        : null,
    reviewedAt: typeof raw?.reviewedAt === "string" ? raw.reviewedAt : null,
    assets: Array.isArray(raw?.assets)
      ? raw.assets.map(normalizeIdentityAsset)
      : [],
  };
}

export async function listIdentitySets(): Promise<IdentitySet[]> {
  const token = requireToken();
  const resp = await fetchWithRetry(IDENTITY_BASE, {
    method: "GET",
    headers: authHeaders(token),
  });

  let data: any = [];
  try {
    data = await resp.json();
  } catch {
    data = [];
  }

  if (!resp.ok) {
    const message =
      (data && typeof data?.message === "string" && data.message) ||
      resp.statusText ||
      "Khong the tai danh sach giay to";
    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  const sets = data.map(normalizeIdentitySet) as IdentitySet[];
  // Sort by id desc to make latest first, fallback to original order
  return sets.sort((a, b) => (b.id || 0) - (a.id || 0));
}