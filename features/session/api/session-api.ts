import axiosClient from "@/core/network/axios-client";
import { SESSION_ID_KEY } from "@/core/constants/common-constants";
export const createSession = async (): Promise<string | null> => {
    const response = await axiosClient.post(`/salon/sessions/`);
    if (response.status === 201) {
        //salon session id
        localStorage.setItem(SESSION_ID_KEY, response.data.data.id);
        return response.data.data.id;
    }
    return null;
}
export const endSession = async (sessionId: string) => {
    const response = await axiosClient.post(`/salon/sessions/${sessionId}/end-session/`);
    if (response.status === 200) {

        return response.data.data.id;
    }
    return null;
}