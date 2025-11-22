import { API_BASE, authHeaders } from "./authService";

const FEEDBACK_BASE = `${API_BASE}/renter/feedbacks`;

export interface FeedbackContent {
  type: "FEEDBACK";
  rating: number; // 1-5 stars
  content: string;
  imageUrls?: string[];
}

export interface FeedbackResponse {
  id: number;
  billingId: number;
  renterId: number;
  stationId?: number;
  staffId?: number;
  adminId?: number;
  type: "FEEDBACK";
  rating: number;
  content: string;
  imageUrls?: string[];
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  staffNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListResponse {
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
  content: FeedbackResponse[];
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
 * Get all feedbacks with pagination
 */
export async function listFeedbacks(
  page: number = 0,
  size: number = 10,
  sort: string = "createdAt,desc"
): Promise<FeedbackListResponse> {
  const token = requireToken();
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });

  const url = `${FEEDBACK_BASE}?${params}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message || resp.statusText || "Không thể lấy danh sách feedback";
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as FeedbackListResponse;
}

/**
 * Get feedback for a specific billing/booking
 */
export async function getFeedbackByBillingId(
  billingId: number
): Promise<FeedbackResponse | null> {
  try {
    const token = requireToken();
    const resp = await fetch(`${FEEDBACK_BASE}/${billingId}`, {
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

    return data as FeedbackResponse;
  } catch (error) {
    // If it's a 404, just return null
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

/**
 * Submit feedback for a booking
 * @param billingId - The billing/booking ID
 * @param feedback - Feedback content (rating, content)
 * @param imageFiles - Optional array of image files to upload
 */
export async function submitFeedback(
  billingId: number,
  feedback: Omit<FeedbackContent, "imageUrls">,
  imageFiles?: File[]
): Promise<FeedbackResponse> {
  const token = requireToken();

  const formData = new FormData();
  
  // Create the data object as JSON string
  const dataObj = {
    billingId,
    type: feedback.type,
    rating: feedback.rating,
    content: feedback.content,
  };
  formData.append("data", JSON.stringify(dataObj));

  // Append image files if provided
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  const resp = await fetch(FEEDBACK_BASE, {
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
        ? "Bạn đã gửi feedback cho chuyến đi này rồi"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as FeedbackResponse;
}

/**
 * Update feedback (if allowed)
 * @param feedbackId - The feedback ID to update
 * @param feedback - Feedback content (rating, content)
 * @param imageFiles - Optional array of image files to upload (replaces existing)
 */
export async function updateFeedback(
  feedbackId: number,
  feedback: Partial<Omit<FeedbackContent, "imageUrls">>,
  imageFiles?: File[]
): Promise<FeedbackResponse> {
  const token = requireToken();

  const formData = new FormData();
  
  // Create the data object as JSON string
  const dataObj: any = {};
  if (feedback.type !== undefined) dataObj.type = feedback.type;
  if (feedback.rating !== undefined) dataObj.rating = feedback.rating;
  if (feedback.content !== undefined) dataObj.content = feedback.content;
  
  formData.append("data", JSON.stringify(dataObj));

  // Append image files if provided
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  }

  const resp = await fetch(`${FEEDBACK_BASE}/${feedbackId}`, {
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
        ? "Không thể chỉnh sửa feedback đã được duyệt"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }

  return data as FeedbackResponse;
}

/**
 * Delete feedback (if allowed)
 */
export async function deleteFeedback(feedbackId: number): Promise<void> {
  const token = requireToken();

  const resp = await fetch(`${FEEDBACK_BASE}/${feedbackId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    const msg =
      data?.message ||
      (resp.status === 409
        ? "Không thể xóa feedback đã được duyệt"
        : resp.statusText);
    throw new Error(`HTTP ${resp.status}: ${msg}`);
  }
}
