import { API_BASE } from "@/services/authService";

export type StaffBillingStatus =
  | "WAITING"
  | "PAYED"
  | "RENTING"
  | "DONE"
  | "CANCELLED";

export interface StaffBillingResponse {
  id: number;
  renterId: number;
  renterName: string;
  renterEmail?: string | null;
  vehicleId: number;
  vehicleModel?: string | null;
  rentedDay?: number | null;
  bookingTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  preImage?: string | null;
  finalImage?: string | null;
  status: StaffBillingStatus;
  penaltyCost?: number | null;
  note?: string | null;
}

interface UpdateImagePayload {
  preImage?: string;
  finalImage?: string;
}

interface CheckInPayload {
  preImage?: string;
}

export interface ReturnInspectionPayload {
  finalImage: string;
  penaltyCost?: number;
  note?: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("staff_token") || "";
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function handleResponse<T>(resp: Response, fallback: string): Promise<T> {
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText);
    const message = text || `${fallback} (HTTP ${resp.status})`;
    throw new Error(message);
  }
  const data = (await resp.json().catch(() => null)) as T | null;
  if (data === null) {
    throw new Error("Không đọc được dữ liệu phản hồi từ máy chủ.");
  }
  return data;
}

function requireStaffToken(): void {
  if (!localStorage.getItem("staff_token")) {
    throw new Error("Bạn cần đăng nhập tài khoản nhân viên để sử dụng chức năng này.");
  }
}

export async function getStationBillings(): Promise<StaffBillingResponse[]> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/station`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse<StaffBillingResponse[]>(
    resp,
    "Không tải được danh sách hóa đơn theo trạm"
  );
}

export async function updatePreImage(
  id: number,
  preImage: string
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/pre-image`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ preImage }),
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không cập nhật được hình ảnh trước khi nhận xe"
  );
}

export async function updateFinalImage(
  id: number,
  finalImage: string
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/final-image`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ finalImage }),
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không cập nhật được hình ảnh khi trả xe"
  );
}

export async function approvePayment(
  id: number
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/approve-payment`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không duyệt được thanh toán"
  );
}

export async function checkInBilling(
  id: number,
  payload?: CheckInPayload
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/check-in`, {
    method: "POST",
    headers: authHeaders(),
    body: payload ? JSON.stringify(payload) : "{}",
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không thực hiện được thao tác check-in"
  );
}

export async function checkInByPhone(
  phone: string,
  payload?: CheckInPayload
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const endpoint = `${API_BASE}/staff/billings/check-in/by-phone?phone=${encodeURIComponent(phone)}`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: authHeaders(),
    body: payload ? JSON.stringify(payload) : "{}",
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không tìm thấy hóa đơn phù hợp để check-in"
  );
}

export async function inspectReturn(
  id: number,
  payload: ReturnInspectionPayload
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/inspect-return`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không thể ghi nhận kiểm tra xe trả"
  );
}

export async function approvePenalty(
  id: number
): Promise<StaffBillingResponse> {
  requireStaffToken();
  const resp = await fetch(`${API_BASE}/staff/billings/${id}/approve-penalty`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<StaffBillingResponse>(
    resp,
    "Không thể duyệt thanh toán tiền phạt"
  );
}