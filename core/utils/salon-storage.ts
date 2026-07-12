import { CURRENT_SALON_STORAGE_KEY } from "@/core/constants/common-constants";

export type CurrentSalonPayload = {
  id?: number;
  name?: string;
  code?: string;
  address?: string;
  logo_image?: string;
  is_active?: boolean;
  makeup_enabled?: boolean;
  user?: number;
  [key: string]: unknown;
};

export function persistCurrentSalon(data: CurrentSalonPayload): void {
  try {
    localStorage.setItem(CURRENT_SALON_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("persistCurrentSalon:", e);
  }
}

export function getStoredSalon(): CurrentSalonPayload | null {
  try {
    const raw = localStorage.getItem(CURRENT_SALON_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentSalonPayload;
  } catch {
    return null;
  }
}

export function getStoredSalonCode(): string | null {
  const s = getStoredSalon();
  const c = s?.code;
  return typeof c === "string" && c.length > 0 ? c : null;
}
