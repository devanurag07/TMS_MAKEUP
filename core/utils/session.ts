import { createSession } from "@/features/session/api/session-api";
import { SESSION_ID_KEY } from "../constants/common-constants";

export const getSessionId = async () => {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (sessionId) {
        return sessionId;
    }
    else {
        let newSessionId = await createSession();
        if (newSessionId) {
            localStorage.setItem(SESSION_ID_KEY, newSessionId);
            return newSessionId;
        }
        else {
            return null;
        }
    }
}

