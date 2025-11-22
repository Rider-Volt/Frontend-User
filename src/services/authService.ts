// src/services/authService.ts

import { IdentitySet } from "@/types/identity";

// In development, always route through the Vite proxy at /api to avoid CORS
export const API_BASE = import.meta.env.DEV ? "/api" : "https://backend.ridervolt.app/api";

// Endpoints cho renter/admin/staff (chỉ dùng API mới của BE)
export const PROFILE_ENDPOINTS = {
  login: `${API_BASE}/renter/login`,
  logout: `${API_BASE}/logout`,
  register: `${API_BASE}/register`,
  renterMe: `${API_BASE}/renter/me`,
};
// Gọi /api/renter/me để lấy id và thông tin profile
export async function fetchRenterMe(token?: string): Promise<RenterProfileApiResponse> {
  const effectiveToken = token || getAuthToken();
  const resp = await fetch(PROFILE_ENDPOINTS.renterMe, {
    method: "GET",
    headers: authHeaders(effectiveToken),
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }

  if (!resp.ok) {
    const message =
      (typeof data?.message === "string" && data.message) ||
      "Không lấy được thông tin renter/me";
    throw new Error(message);
  }

  return (data || {}) as RenterProfileApiResponse;
}

// Staff endpoints
export const STAFF_ENDPOINTS = {
  login: `${API_BASE}/staff/login`,
};

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  username: string;
  full_name?: string;
  email?: string;
  status?: string;
  is_active?: boolean;

  // các field UI dùng nhưng BE có thể chưa trả — để optional
  phone?: string;
  avatar?: string;
  address?: string;
  joinDate?: string;      // ISO string từ BE (UI sẽ format)
  totalBookings?: number;
  totalSpent?: number;    // VND
  rating?: number;
  id?: number;
  userId?: number;
  licenseNumber?: string;
  nationalId?: string;
  // URL ảnh giấy tờ
  nationalIdImageUrl?: string;
  driverLicenseImageUrl?: string;
  verified?: boolean;
  identitySets?: IdentitySet[];
}

export interface RenterProfileApiResponse {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  driverLicense?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  message?: string;
  // URL ảnh giấy tờ nếu BE trả về
  nationalIdImageUrl?: string;
  driverLicenseImageUrl?: string;
  verified?: boolean;
  identitySets?: IdentitySet[];
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  nationalId?: string;
  password?: string;
  avatarFile?: File | null;
  // ảnh giấy tờ
  nationalIdImageFile?: File | null;
  driverLicenseImageFile?: File | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  recaptchaToken: string;
}

export interface RegisterResponseApi {
  message?: string;
  id?: number;
}

export function getAuthToken(): string | undefined {
  return localStorage.getItem("token") || undefined;
}

export function authHeaders(token?: string, contentType: string | null = "application/json") {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Helpers to normalize ids from various backend payloads or JWT
function toSafeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function extractIdFromToken(token?: string): number | undefined {
  if (!token) return undefined;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return undefined;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    // Try common claim keys
    return (
      toSafeNumber(payload?.userId) ||
      toSafeNumber(payload?.id) ||
      toSafeNumber(payload?.renterId) ||
      toSafeNumber(payload?.sub)
    );
  } catch {
    return undefined;
  }
}

interface LoginTokens {
  accessToken: string;
  refreshToken?: string;
  renterName?: string;
  status?: string;
}

function mergeLoginState(
  tokens: LoginTokens,
  profile: RenterProfileApiResponse | undefined,
  previous: LoginResponse | null
): LoginResponse {
  const base = previous || ({} as LoginResponse);
  const trimmedName = profile?.fullName?.trim();
  const fallbackName =
    trimmedName ||
    tokens.renterName ||
    base.full_name ||
    base.username ||
    base.email ||
    "";
  const resolvedId =
    toSafeNumber(profile?.id) ??
    extractIdFromToken(tokens.accessToken) ??
    toSafeNumber(base.id) ??
    toSafeNumber(base.userId);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? base.refreshToken,
    username: fallbackName || base.username || "",
    full_name: fallbackName || base.full_name,
    email: profile?.email ?? base.email,
    status: tokens.status ?? base.status,
    is_active: base.is_active,
    phone: profile?.phone ?? base.phone,
    avatar: profile?.avatarUrl ?? base.avatar,
    address: base.address,
    joinDate: base.joinDate,
    totalBookings: base.totalBookings,
    totalSpent: base.totalSpent,
    rating: base.rating,
    id: resolvedId,
    userId: resolvedId,
    licenseNumber: profile?.driverLicense ?? base.licenseNumber,
    nationalId: profile?.nationalId ?? base.nationalId,
    nationalIdImageUrl: profile?.nationalIdImageUrl ?? base.nationalIdImageUrl,
    driverLicenseImageUrl:
      profile?.driverLicenseImageUrl ?? base.driverLicenseImageUrl,
    verified:
      typeof profile?.verified === "boolean" ? profile.verified : base.verified,
    identitySets: Array.isArray(profile?.identitySets)
      ? profile?.identitySets
      : base.identitySets,
  };
}

function mergeProfileOnly(
  current: LoginResponse,
  profile?: RenterProfileApiResponse
): LoginResponse {
  if (!profile) return current;
  return mergeLoginState(
    {
      accessToken: current.accessToken,
      refreshToken: current.refreshToken,
      renterName: current.full_name || current.username,
      status: current.status,
    },
    profile,
    current
  );
}

// Đăng ký
export async function register(payload: RegisterPayload): Promise<RegisterResponseApi> {
  const resp = await fetch(PROFILE_ENDPOINTS.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: RegisterResponseApi = {};
  try { data = await resp.json(); } catch { data = {}; }

  if (!resp.ok) {
    throw new Error(data.message || "Đăng ký thất bại");
  }
  return data;
}

// Đăng nhập
export async function login(email: string, password: string, recaptchaToken?: string): Promise<LoginResponse> {
  // Validation
  if (!email?.trim()) {
    throw new Error("Email không được để trống");
  }
  
  if (!password?.trim()) {
    throw new Error("Mật khẩu không được để trống");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error("Email không hợp lệ");
  }

  const payload: { email: string; password: string; recaptchaToken?: string } = {
    email: email.trim(),
    password: password.trim(),
  };

  if (recaptchaToken?.trim()) {
    payload.recaptchaToken = recaptchaToken.trim();
  }

  const resp = await fetch(PROFILE_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }

  if (!resp.ok) {
    const status = resp.status;
    let errorMessage = data?.message || resp.statusText || "Sai email hoặc mật khẩu";
    
    // Specific error messages based on status
    switch (status) {
      case 400:
        errorMessage = "Dữ liệu đăng nhập không hợp lệ";
        break;
      case 401:
        errorMessage = "Email hoặc mật khẩu không đúng";
        break;
      case 403:
        errorMessage = "Tài khoản bị khóa hoặc chưa được xác thực";
        break;
      case 429:
        errorMessage = "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau";
        break;
      case 500:
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau";
        break;
    }
    
    throw new Error(`HTTP ${status}: ${errorMessage}`);
  }

  if (typeof data?.accessToken !== "string" || !data.accessToken) {
    throw new Error("Phản hồi đăng nhập không hợp lệ: thiếu accessToken");
  }

  const tokens: LoginTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    renterName: data.renterName || data.username,
    status: typeof data.status === "string" ? data.status : undefined,
  };

  let profile: RenterProfileApiResponse | undefined;
  try {
    profile = await fetchRenterMe(tokens.accessToken);
  } catch {
    profile = undefined;
  }

  const previous = getCurrentUser();
  const merged = mergeLoginState(tokens, profile, previous);

  localStorage.setItem("token", merged.accessToken);
  localStorage.setItem("user", JSON.stringify(merged));

  return merged;
}

// Lấy user hiện tại từ localStorage (không gọi mạng)
export function getCurrentUser(): LoginResponse | null {
  const u = localStorage.getItem("user");
  if (!u) return null;
  return JSON.parse(u) as LoginResponse;
}

export async function fetchProfileFromAPI(): Promise<LoginResponse> {
  return refreshCurrentUser();
}

export async function refreshCurrentUser(): Promise<LoginResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn chưa đăng nhập");
  }
  const current = getCurrentUser();
  const profile = await fetchRenterMe(token);
  const merged = mergeLoginState(
    {
      accessToken: token,
      refreshToken: current?.refreshToken,
      renterName: current?.full_name || current?.username,
      status: current?.status,
    },
    profile,
    current
  );
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
}

// Không còn dùng /user/me — hàm này được loại bỏ.

// Trả về userId hiện tại (ưu tiên localStorage, fallback decode JWT) và đồng bộ vào localStorage nếu thiếu
export function getCurrentUserId(): number | undefined {
  const current = getCurrentUser();
  const direct = toSafeNumber(current?.id) || toSafeNumber(current?.userId);
  if (direct) return direct;

  const token = localStorage.getItem("token") || undefined;
  const fromJwt = extractIdFromToken(token);
  if (fromJwt && current) {
    const patched: LoginResponse = { ...current, id: fromJwt, userId: fromJwt };
    localStorage.setItem("user", JSON.stringify(patched));
  }
  return fromJwt;
}

// Update identity numbers (CCCD và GPLX numbers)
export interface UpdateIdentityNumbersParams {
  cccdNumber?: string;
  gplxNumber?: string;
}

export async function updateIdentityNumbers(
  params: UpdateIdentityNumbersParams,
  token: string
): Promise<RenterProfileApiResponse> {
  const queryParams = new URLSearchParams();
  if (params.cccdNumber) {
    queryParams.append("cccdNumber", params.cccdNumber);
  }
  if (params.gplxNumber) {
    queryParams.append("gplxNumber", params.gplxNumber);
  }

  const url = `${API_BASE}/renter/identity-numbers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  
  const resp = await fetch(url, {
    method: "PATCH",
    headers: authHeaders(token, "application/json"),
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }

  if (!resp.ok) {
    const message =
      (typeof data?.message === "string" && data.message) ||
      "Không thể cập nhật số giấy tờ";
    throw new Error(message);
  }

  return data as RenterProfileApiResponse;
}

// Upload identity document (CCCD và GPLX cùng lúc)
export async function uploadIdentityDocument(
  field: "cccd" | "gplx",
  file: File,
  token: string,
  side: "front" | "back" = "front"
): Promise<RenterProfileApiResponse> {
  const form = new FormData();
  form.append(field, file);
  
  // Thêm query parameter side theo tài liệu API
  const queryParams = new URLSearchParams();
  queryParams.append("side", side);
  
  const url = `${API_BASE}/renter/${field === "cccd" ? "cccd" : "gplx"}?${queryParams.toString()}`;
  
  const resp = await fetch(url, {
    method: "POST",
    headers: authHeaders(token, null),
    body: form,
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }

  if (!resp.ok) {
    const message =
      (typeof data?.message === "string" && data.message) ||
      `Không thể cập nhật ${field.toUpperCase()}`;
    throw new Error(message);
  }

  return data as RenterProfileApiResponse;
}

// Cập nhật hồ sơ
export async function updateUser(userPatch: UpdateUserPayload): Promise<LoginResponse> {
  const current = getCurrentUser();
  if (!current || !current.accessToken) {
    throw new Error("Bạn cần đăng nhập trước khi cập nhật hồ sơ");
  }

  const token = current.accessToken;
  const form = new FormData();
  let hasProfileChange = false;

  if (typeof userPatch.full_name === "string") {
    const trimmed = userPatch.full_name.trim();
    if (trimmed.length > 0 && trimmed !== (current.full_name || "")) {
      form.append("name", trimmed);
      hasProfileChange = true;
    }
  }

  if (typeof userPatch.phone === "string") {
    const trimmed = userPatch.phone.trim();
    if (trimmed.length > 0 && trimmed !== (current.phone || "")) {
      form.append("phone", trimmed);
      hasProfileChange = true;
    }
  }

  if (
    typeof userPatch.password === "string" &&
    userPatch.password.trim().length >= 8
  ) {
    form.append("password", userPatch.password.trim());
    hasProfileChange = true;
  }

  if (userPatch.avatarFile instanceof File) {
    form.append("avatar", userPatch.avatarFile);
    hasProfileChange = true;
  }

  let nextState: LoginResponse = current;

  if (hasProfileChange) {
    const resp = await fetch(PROFILE_ENDPOINTS.renterMe, {
      method: "PATCH",
      headers: authHeaders(token, null),
      body: form,
    });

    let data: any = {};
    try {
      data = await resp.json();
    } catch {
      data = {};
    }

    if (!resp.ok) {
      const message =
        (typeof data?.message === "string" && data.message) ||
        "Không thể cập nhật hồ sơ";
      throw new Error(message);
    }

    nextState = mergeProfileOnly(current, data as RenterProfileApiResponse);
  }

  // Upload identity documents
  const hasCccd = userPatch.nationalIdImageFile instanceof File;
  const hasGplx = userPatch.driverLicenseImageFile instanceof File;

  // Upload CCCD file if present
  if (hasCccd) {
    try {
      const profileAfterCccd = await uploadIdentityDocument(
        "cccd",
        userPatch.nationalIdImageFile!,
        token,
        "front" // Default to front side
      );
      nextState = mergeProfileOnly(nextState, profileAfterCccd);
    } catch (error) {
      console.warn("Lỗi upload CCCD:", error);
      // Continue with other operations even if CCCD upload fails
    }
  }

  // Upload GPLX file if present
  if (hasGplx) {
    try {
      const profileAfterGplx = await uploadIdentityDocument(
        "gplx",
        userPatch.driverLicenseImageFile!,
        token,
        "front" // Default to front side
      );
      nextState = mergeProfileOnly(nextState, profileAfterGplx);
    } catch (error) {
      console.warn("Lỗi upload GPLX:", error);
      // Continue with other operations even if GPLX upload fails
    }
  }

  // Các trường chỉ lưu local (address, licenseNumber, nationalId) vì BE chưa hỗ trợ
  if (typeof userPatch.address === "string") {
    nextState = { ...nextState, address: userPatch.address };
  }
  if (typeof userPatch.licenseNumber === "string") {
    nextState = { ...nextState, licenseNumber: userPatch.licenseNumber };
  }
  if (typeof userPatch.nationalId === "string") {
    nextState = { ...nextState, nationalId: userPatch.nationalId };
  }

  localStorage.setItem("user", JSON.stringify(nextState));
  return nextState;
}

// Logout
export async function logoutApi(): Promise<void> {
  const token = localStorage.getItem("token") || "";
  const userRaw = localStorage.getItem("user");
  let refreshToken: string | undefined;
  try {
    if (userRaw) refreshToken = (JSON.parse(userRaw) as any)?.refreshToken;
  } catch {}

  // If there's no refresh token, skip calling backend to avoid 400/403 noise.
  if (!refreshToken) {
    return;
  }

  // Prepare a short-timeout POST with refreshToken; do not spam console on errors.
  const body = JSON.stringify({ refreshToken });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    await fetch(PROFILE_ENDPOINTS.logout, {
      method: "POST",
      headers: authHeaders(token, "application/json"),
      body,
      signal: controller.signal,
    }).catch(() => {});
  } finally {
    clearTimeout(timeout);
    // Get current user ID before clearing the user data
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || currentUser?.userId;
    
    // Clear local state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear booking history for the current user
    if (userId) {
      try {
        // Import the clearBookingHistory function
        const { clearBookingHistory } = await import('./bookingService');
        clearBookingHistory(userId);
      } catch (error) {
        console.error('Failed to clear booking history on logout:', error);
      }
    }
  }
}

// Đã bỏ mapper dành cho /user/me

// Staff login (không cần reCAPTCHA)
export interface StaffLoginResponse {
  accessToken: string;
  staffName: string;
  staffId: number;
  stationId: number | null;
}

export async function staffLogin(email: string, password: string): Promise<StaffLoginResponse> {
  const tryLogin = async (payload: Record<string, unknown>) => {
    const resp = await fetch(STAFF_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    let data: any = {};
    try { data = await resp.json(); } catch { data = {}; }
    return { resp, data } as const;
  };

  // First: email/password (matches backend DTO)
  let { resp, data } = await tryLogin({ email, password });
  // If rejected, retry with username/password to cover alternate BE expectations
  if (!resp.ok && (resp.status === 400 || resp.status === 401 || resp.status === 403)) {
    const second = await tryLogin({ username: email, password });
    if (second.resp.ok || second.resp.status === 403) {
      resp = second.resp; data = second.data;
    }
  }

  if (!resp.ok) {
    const status = resp.status;
    const base = data?.message || resp.statusText || "Đăng nhập nhân viên thất bại";
    const hint = status === 403 ? " (Không tìm thấy tài khoản STAFF cho email này hoặc mật khẩu không đúng)" : "";
    throw new Error(`HTTP ${status}: ${base}${hint}`);
  }

  const result: StaffLoginResponse = {
    accessToken: data.accessToken,
    staffName: data.staffName,
    staffId: data.staffId,
    stationId: typeof data.stationId === "number" ? data.stationId : null,
  };

  // Lưu riêng để không xung đột renter
  localStorage.setItem("staff_token", result.accessToken);
  localStorage.setItem("staff_user", JSON.stringify(result));
  return result;
}

// Test function để kiểm tra API login
export async function testLoginAPI(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const testPayload = {
      email: "test@example.com",
      password: "testpassword",
      recaptchaToken: "test-token"
    };

    const resp = await fetch(PROFILE_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(testPayload),
    });

    const data = await resp.json().catch(() => ({}));

    return {
      success: resp.ok,
      message: resp.ok ? "API endpoint hoạt động" : `HTTP ${resp.status}: ${data?.message || resp.statusText}`,
      data: resp.ok ? data : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Staff logout: clear only staff-related storage
export function staffLogout(): void {
  try {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_user");
  } catch {}
}

// Password Reset
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
  passwordMatching: boolean;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  // Validation
  if (!payload.email?.trim()) {
    throw new Error("Email không được để trống");
  }
  
  if (!payload.newPassword?.trim()) {
    throw new Error("Mật khẩu mới không được để trống");
  }
  
  if (!payload.confirmPassword?.trim()) {
    throw new Error("Xác nhận mật khẩu không được để trống");
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email.trim())) {
    throw new Error("Email không hợp lệ");
  }
  
  // Password validation
  if (payload.newPassword.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }
  
  // Password matching validation
  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error("Mật khẩu xác nhận không khớp");
  }
  
  const requestBody = {
    email: payload.email.trim(),
    newPassword: payload.newPassword.trim(),
    confirmPassword: payload.confirmPassword.trim(),
    passwordMatching: payload.newPassword === payload.confirmPassword,
  };
  
  const resp = await fetch(`${API_BASE}/renter/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  
  let data: any = {};
  try {
    data = await resp.json();
  } catch {
    data = {};
  }
  
  if (!resp.ok) {
    const message = data?.message || resp.statusText || "Không thể đặt lại mật khẩu";
    throw new Error(`HTTP ${resp.status}: ${message}`);
  }
  
  // Success - API returns 200 with message "Password reset successfully"
  return;
}