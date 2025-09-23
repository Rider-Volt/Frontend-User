// src/services/authService.ts

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  username: string;
  full_name?: string;
  email?: string;
  status?: string;
  is_active?: boolean;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const resp = await fetch("https://ridervolt-761a9cacc040.herokuapp.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || "Login failed");

  const userData: LoginResponse = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    username: data.userName,
    full_name: data.userName,
    email,
    status: "ACTIVE",
    is_active: true,
  };

  localStorage.setItem("token", userData.accessToken);
  localStorage.setItem("user", JSON.stringify(userData));

  return userData;
}

export function getCurrentUser(): LoginResponse | null {
  const u = localStorage.getItem("user");
  if (!u) return null;
  return JSON.parse(u);
}

// Gọi API logout + clear localStorage
export async function logoutApi(): Promise<void> {
  const token = localStorage.getItem("token");
  try {
    await fetch("https://ridervolt-761a9cacc040.herokuapp.com/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    console.error("Logout API error:", err);
    // có thể thông báo lỗi nhưng vẫn clear bên dưới
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
