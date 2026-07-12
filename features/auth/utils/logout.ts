import {
  CURRENT_SALON_STORAGE_KEY,
  INPUT_AVAILABLE_KEY,
  SALON_LOGO_KEY,
  SESSION_ID_KEY,
  SHOW_QUESTIONS_KEY,
  TOKEN_KEY,
} from "@/core/constants/common-constants";

export function logoutMirror(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem(CURRENT_SALON_STORAGE_KEY);
  localStorage.removeItem(SALON_LOGO_KEY);
  localStorage.removeItem(SHOW_QUESTIONS_KEY);
  localStorage.removeItem(INPUT_AVAILABLE_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
  window.location.reload();
}
