import { API_BASE, authHeaders, getAuthToken } from "./authService";

const BASE = `${API_BASE}/renter/billings`;

function requireToken(): string {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Ban can dang nhap de thao tac voi hoa don");
  }
  return token;
}

export type BillingStatus =
  | "WAITING"
  | "PAYED"
  | "RENTING"
  | "DONE"
  | "CANCELLED";

export interface CreateBillingRequest {
  stationId: number;
  modelId: number;
  startDay: string;
  endDay: string;
}

export interface RenterBillingResponse {
  id: number;
  renterName: string;
  vehicleCode: string;
  vehicleModel: string;
  rentedDay: number;
  bookingTime: string;
  startDay: string;
  endDay: string;
  preImage?: string | null;
  finalImage?: string | null;
  status: BillingStatus;
  totalCost?: number | null;
}

export async function createBilling(
  req: CreateBillingRequest
): Promise<RenterBillingResponse> {
  const token = requireToken();
  const resp = await fetch(BASE, {
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
  return data as RenterBillingResponse;
}

export async function listMyBillings(
  status?: BillingStatus
): Promise<RenterBillingResponse[]> {
  const token = requireToken();
  const url = status ? `${BASE}?status=${encodeURIComponent(status)}` : BASE;
  const resp = await fetch(url, {
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => []);
  if (!resp.ok) throw new Error(data?.message || resp.statusText);
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

export async function getCheckInQrPayload(
  id: number
): Promise<{ qrPayload: { type: string; billingId: number } }> {
  const token = requireToken();
  const resp = await fetch(`${BASE}/${id}/check-in/qr`, {
    headers: authHeaders(token),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.message || resp.statusText);
  return data as { qrPayload: { type: string; billingId: number } };
}
