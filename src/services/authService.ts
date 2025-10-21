// src/services/authService.ts

// In development, always route through the Vite proxy at /api to avoid CORS
export const API_BASE = import.meta.env.DEV ? "/api" : "https://backend.ridervolt.app/api";

// Cho phép chỉnh endpoint nếu BE khác tên
export const PROFILE_ENDPOINTS = {
  me: `${API_BASE}/user/me`,          // GET thông tin hồ sơ theo token
  update: `${API_BASE}/user/me`,      // PATCH cập nhật hồ sơ
  // BE quy định renter login tại /renter/login
  login: `${API_BASE}/renter/login`,
  logout: `${API_BASE}/logout`,
  register: `${API_BASE}/register`,
};

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
}

interface ProfileApiResponse {
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
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  nationalId?: string;
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

function authHeaders(token?: string, contentType: string | null = "application/json") {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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
  const resp = await fetch(PROFILE_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ email, password, recaptchaToken }),
  });

  let data: any = {};
  try { data = await resp.json(); } catch { data = {}; }

  if (!resp.ok) {
    const status = resp.status;
    const base = data?.message || resp.statusText || "Sai email hoặc mật khẩu";
    throw new Error(`HTTP ${status}: ${base}`);
  }

  const userData: LoginResponse = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    // RenterAuthResponse trả về renterName
    username: data.renterName || email,
    full_name: data.renterName,
    email: data.email || email,
    status: data.status || "ACTIVE",
    is_active: data.is_active ?? true,
    phone: data.phone || "",
    avatar: data.avatar || "",
    address: data.address || "",
    joinDate: data.joinDate || undefined,
    totalBookings: data.totalBookings || 0,
    totalSpent: data.totalSpent || 0,
    rating: data.rating || 5,
    id: typeof data.id === "number" ? data.id : undefined,
    userId: typeof data.userId === "number" ? data.userId : undefined,
    licenseNumber: data.licenseNumber || "",
  };

  localStorage.setItem("token", userData.accessToken);
  localStorage.setItem("user", JSON.stringify(userData));

  try {
    const profile = await fetchProfileFromAPI();
    const merged: LoginResponse = {
      ...userData,
      ...profile,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      username: profile.username || profile.full_name || userData.username,
      full_name: profile.full_name || profile.username || userData.full_name,
    };
    localStorage.setItem("user", JSON.stringify(merged));
    return merged;
  } catch {
    return userData;
  }
}

// Lấy user hiện tại từ localStorage (không gọi mạng)
export function getCurrentUser(): LoginResponse | null {
  const u = localStorage.getItem("user");
  if (!u) return null;
  return JSON.parse(u) as LoginResponse;
}

// Gọi API lấy hồ sơ theo token (nếu BE hỗ trợ /user/me)
export async function fetchProfileFromAPI(): Promise<LoginResponse> {
  const token = localStorage.getItem("token") || "";
  const resp = await fetch(PROFILE_ENDPOINTS.me, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data: ProfileApiResponse = await resp.json().catch(() => ({} as ProfileApiResponse));
  if (!resp.ok) {
    throw new Error(data.message || "Không lấy được hồ sơ");
  }

  // Ghép vào local user (giữ accessToken cũ nếu BE không trả lại)
  const current = getCurrentUser();
  const inferredName = data.fullName || current?.full_name || current?.username || current?.email || "";
  const parseNumeric = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };
  const normalizedId = data.id ?? parseNumeric(current?.id ?? current?.userId);

  const merged: LoginResponse = {
    ...(current || {}),
    username: inferredName,
    full_name: data.fullName ?? current?.full_name ?? inferredName,
    email: data.email ?? current?.email,
    phone: data.phone ?? current?.phone,
    avatar: data.avatarUrl ?? current?.avatar,
    licenseNumber: data.driverLicense ?? current?.licenseNumber,
    nationalId: data.nationalId ?? current?.nationalId,
    nationalIdImageUrl: data.nationalIdImageUrl ?? current?.nationalIdImageUrl,
    driverLicenseImageUrl: data.driverLicenseImageUrl ?? current?.driverLicenseImageUrl,
    id: normalizedId,
    userId: normalizedId,
    accessToken: current?.accessToken || token,
  };

  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
}

// Cập nhật hồ sơ
export async function updateUser(userPatch: UpdateUserPayload): Promise<LoginResponse> {
  const token = localStorage.getItem("token") || "";
  const hasAvatar = Boolean(userPatch.avatarFile);
  const hasNationalIdImg = Boolean(userPatch.nationalIdImageFile);
  const hasDriverLicenseImg = Boolean(userPatch.driverLicenseImageFile);
  const payload = toBackendProfilePayload(userPatch);

  let body: BodyInit;
  let headers: Record<string, string>;

  if (hasAvatar || hasNationalIdImg || hasDriverLicenseImg) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    if (userPatch.avatarFile) {
      formData.append("avatar", userPatch.avatarFile);
    }
    if (userPatch.nationalIdImageFile) {
      formData.append("nationalIdImage", userPatch.nationalIdImageFile);
    }
    if (userPatch.driverLicenseImageFile) {
      formData.append("driverLicenseImage", userPatch.driverLicenseImageFile);
    }
    body = formData;
    headers = authHeaders(token, null);
  } else {
    body = JSON.stringify(payload);
    headers = authHeaders(token);
  }

  const resp = await fetch(PROFILE_ENDPOINTS.update, {
    method: "PATCH",
    headers,
    body,
  });

  const data: ProfileApiResponse & { message?: string } =
    (await resp.json().catch(() => ({}))) as ProfileApiResponse & { message?: string };

  if (!resp.ok) {
    throw new Error(data?.message || "Cập nhật thất bại");
  }

  const current = getCurrentUser();
  const merged: LoginResponse = {
    ...(current || {}),
    username:
      data.fullName ??
      current?.username ??
      current?.full_name ??
      current?.email ??
      "",
    full_name: data.fullName ?? current?.full_name,
    email: data.email ?? current?.email,
    phone: data.phone ?? current?.phone,
    avatar: data.avatarUrl ?? current?.avatar,
    licenseNumber: data.driverLicense ?? current?.licenseNumber,
    nationalId: data.nationalId ?? current?.nationalId,
    nationalIdImageUrl: data.nationalIdImageUrl ?? current?.nationalIdImageUrl,
    driverLicenseImageUrl: data.driverLicenseImageUrl ?? current?.driverLicenseImageUrl,
    id: data.id ?? current?.id ?? current?.userId,
    userId: data.id ?? current?.userId ?? current?.id,
    accessToken: current?.accessToken || token,
    refreshToken: current?.refreshToken,
  };

  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
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
    // Always clear local state so UI logs out even if server rejected the call
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

function toBackendProfilePayload(userPatch: UpdateUserPayload): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (userPatch.full_name !== undefined) {
    payload.fullName = userPatch.full_name;
  }
  if (userPatch.email !== undefined) {
    payload.email = userPatch.email;
  }
  if (userPatch.phone !== undefined) {
    payload.phone = userPatch.phone;
  }
  if (userPatch.licenseNumber !== undefined) {
    payload.driverLicense = userPatch.licenseNumber;
  }
  if (userPatch.nationalId !== undefined) {
    payload.nationalId = userPatch.nationalId;
  }

  return payload;
}

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

// Staff logout: clear only staff-related storage
export function staffLogout(): void {
  try {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_user");
  } catch {}
}
