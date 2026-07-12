import { UnauthorizedException } from "@/core/exceptions/unauthorized-exception";
import axiosClient from "@/core/network/axios-client";
import { GET_RESULTS_URL } from "@/core/constants/url-constants";

export interface SessionResultItem {
  id: number;
  ratings: unknown[];
  request_id: string;
  polling_url: string;
  is_ready: boolean;
  output_url: string;
  prompt: string;
  created_at: string;
  salon: number;
  session: number;
  /** Display name from the API (shade / look label) */
  hairstyle_name: string;
  is_haircolor: boolean;
  is_beard?: boolean;
}

export interface SessionResultsResponse {
  success: boolean;
  message: string;
  data: SessionResultItem[];
  errors: null | string[];
}

export const fetchResultsApi = async (
  sessionId: string
): Promise<SessionResultsResponse> => {
  try {
    const response = await axiosClient.get(GET_RESULTS_URL(sessionId));
    if (response.status === 200) {
      return response.data;
    }
    throw new UnauthorizedException(response.data.message);
  } catch (error) {
    console.error("Error fetching session results:", error);
    throw error;
  }
};
