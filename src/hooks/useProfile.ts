// src/hooks/useProfile.ts
import { useEffect, useState } from "react";
import { getCurrentUser, LoginResponse } from "@/services/authService";

export function useProfile() {
  const [profile, setProfile] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setProfile(user);
  }, []);

  const updateProfile = (updates: Partial<LoginResponse>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    localStorage.setItem("user", JSON.stringify(updated));
    setProfile(updated);
  };

  return { profile, updateProfile };
}
