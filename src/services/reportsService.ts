import { API_BASE, authHeaders } from "./authService";

const REPORTS_BASE = `${API_BASE}/renter/reports`;

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH";
export type ReportStatus = "PENDING_REVIEW" | "RESOLVED" | "REJECTED" | "CLOSED";

export interface ReportContent {
  billingId: number;
  vehicleId?: number;
  stationId?: number;
  note: string;
  imageUrls?: string[];
  severity: ReportSeverity;
}

export interface ReportResponse {
  id: number;
  billingId: number;
  renterId: number;
  vehicleId?: number;
  stationId?: number;
  note: string;
  imageUrls?: string[];
  severity: ReportSeverity;
  status: ReportStatus;
  staffId?: number;
  adminId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: Array<{
      direction: string;
      nullHandling: string;
      ascending: boolean;
      property: string;
      ignoreCase: boolean;
    }>;
    unpaged: boolean;
    paged: boolean;
  };
  size: number;
  content: ReportResponse[];
  number: number;
  sort: Array<{
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
  }>;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

function requireToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Chưa đăng nhập");
  }
  return token;
}

/**
 * Get all reports with pagination
 */
export async function listReports(
  page: number = 0,
  size: number = 10,
  sort: string = "createdAt,desc"
): Promise<ReportListResponse> {
  const token = requireToken();
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });

  const url = `${REPORTS_BASE}?${params}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message || resp.statusText || "Không thể lấy danh sách báo cáo";
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as ReportListResponse;
}

/**
 * Get report for a specific booking
 */
export async function getReportByBillingId(
  billingId: number
): Promise<ReportResponse | null> {
  try {
    const token = requireToken();
    const resp = await fetch(`${REPORTS_BASE}/${billingId}`, {
      method: "GET",
      headers: authHeaders(token),
    });

    // If not found, return null instead of throwing
    if (resp.status === 404) {
      return null;
    }

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const msg = data?.message || resp.statusText;
      throw new Error(`HTTP ${resp.status}: ${msg}`);
    }

    return data as ReportResponse;
  } catch (error) {
    // If it's a 404, just return null
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

/**
 * Submit vehicle damage/issue report
 * @param report - Report content (billingId, note)
 * Note: severity is not accepted by backend in create request - backend may set it automatically
 * @param imageFiles - Optional array of image files to upload
 */
export async function submitReport(
  report: { billingId: number; note: string },
  imageFiles?: File[]
): Promise<ReportResponse> {
  const token = requireToken();

  const formData = new FormData();
  
  // Create the data object as JSON string
  // Backend IncidentReportCreateRequest only accepts: billingId and note
  const dataObj = {
    billingId: report.billingId,
    note: report.note,
  };
  formData.append("data", JSON.stringify(dataObj));

  // Append image files if provided
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  const resp = await fetch(REPORTS_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    },
    body: formData,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Bạn đã gửi báo cáo cho chuyến đi này rồi"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as ReportResponse;
}

/**
 * Update report (if allowed)
 * @param reportId - The report ID to update
 * @param report - Report content (note, severity)
 * @param imageFiles - Optional array of image files to upload (replaces existing)
 */
export async function updateReport(
  reportId: number,
  report: Partial<Omit<ReportContent, "imageUrls" | "billingId" | "vehicleId" | "stationId">>,
  imageFiles?: File[]
): Promise<ReportResponse> {
  const token = requireToken();

  const formData = new FormData();
  
  // Create the data object as JSON string
  const dataObj: any = {};
  if (report.note !== undefined) dataObj.note = report.note;
  if (report.severity !== undefined) dataObj.severity = report.severity;
  
  formData.append("data", JSON.stringify(dataObj));

  // Append image files if provided
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  const resp = await fetch(`${REPORTS_BASE}/${reportId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    },
    body: formData,
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Không thể chỉnh sửa báo cáo đã được duyệt"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as ReportResponse;
}

/**
 * Delete report (if allowed)
 */
export async function deleteReport(reportId: number): Promise<void> {
  const token = requireToken();

  const resp = await fetch(`${REPORTS_BASE}/${reportId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Không thể xóa báo cáo đã được duyệt"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
}
