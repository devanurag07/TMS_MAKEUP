export const BASE_URL = "https://api.trymystyle.co.in/api";
// export const BASE_URL = "http://localhost:8000/api";

export const LOGIN_URL = `${BASE_URL}/auth/login/`;
export const CHECK_AUTH_URL = "auth/check-auth/";
export const CHANGE_MAKEUP_URL = "salon/makeup/change/";
export const MAKEUP_LOOK_ADVISOR_URL = "salon/makeup/look-advisor/";
export const GET_RESULTS_URL = (sessionId: string) =>
  `salon/mirror/results/?session_id=${sessionId}`;
export const CURRENT_SALON_URL = "salon/current";
