// src/services/authService.ts

export const API_BASE = "https://ridervolt-761a9cacc040.herokuapp.com/api";

// Cho phép chỉnh endpoint nếu BE khác tên
export const PROFILE_ENDPOINTS = {
  me: `${API_BASE}/user/me`,          // GET thông tin hồ sơ theo token
  update: `${API_BASE}/user/update`,  // PUT/PATCH cập nhật hồ sơ
  login: `${API_BASE}/login`,
  logout: `${API_BASE}/logout`,
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
  id?: string;
  licenseNumber?: string;
}

function authHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Đăng nhập
export async function login(email: string, password: string): Promise<LoginResponse> {
  const resp = await fetch(PROFILE_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data: any = {};
  try { data = await resp.json(); } catch { data = {}; }

  if (!resp.ok) {
    throw new Error(data.message || "Sai email hoặc mật khẩu");
  }

  const userData: LoginResponse = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    username: data.userName,
    full_name: data.userName,
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
    id: data.id || data.userName || undefined,
    licenseNumber: data.licenseNumber || "",
  };

  localStorage.setItem("token", userData.accessToken);
  localStorage.setItem("user", JSON.stringify(userData));
  return userData;
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

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.message || "Không lấy được hồ sơ");
  }

  // Ghép vào local user (giữ accessToken cũ nếu BE không trả lại)
  const current = getCurrentUser();
  const merged: LoginResponse = {
    ...(current || {}),
    ...data,
    accessToken: current?.accessToken || data.accessToken,
  };

  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
}

// Cập nhật hồ sơ
export async function updateUser(userPatch: Partial<LoginResponse>): Promise<LoginResponse> {
  const token = localStorage.getItem("token") || "";
  const resp = await fetch(PROFILE_ENDPOINTS.update, {
    method: "PUT", // đổi "PATCH" nếu BE dùng PATCH
    headers: authHeaders(token),
    body: JSON.stringify(userPatch),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.message || "Cập nhật thất bại");
  }

  // Đồng bộ localStorage
  const current = getCurrentUser();
  const merged: LoginResponse = { ...(current || {}), ...data };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
}

// Logout
export async function logoutApi(): Promise<void> {
  const token = localStorage.getItem("token");
  try {
    await fetch(PROFILE_ENDPOINTS.logout, {
      method: "POST",
      headers: authHeaders(token || ""),
    });
  } catch (err) {
    console.error("Logout API error:", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
