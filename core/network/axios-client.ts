import axios from "axios";
import { BASE_URL } from "../constants/url-constants";
import { TOKEN_KEY } from "../constants/common-constants";
import { parse } from "path";
const axiosClient = axios.create({
    baseURL: BASE_URL,
});


axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const skip_urls = [
        "/auth/login/",
        "/auth/register/",
        "/auth/forgot-password/",
        "/auth/reset-password/",
        "/auth/verify-email/",
        "/skin/download-report/"
    ];

    // Skip Bearer token if the URL contains token query param (for PDF generation)
    if (config.url?.includes('/skin/report/?token=')) {
        return config;
    }

    console.log(config.url);

    // Check if the URL matches any skip_urls (works for both relative and absolute URLs)
    const shouldSkipAuth = skip_urls.some(skipUrl =>
        config.url?.includes(skipUrl) ||
        config.url === skipUrl ||
        config.url === BASE_URL + skipUrl
    );

    if (shouldSkipAuth) {
        console.log("Skipping for url ", config.url);
        return config;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
});


export default axiosClient; 
