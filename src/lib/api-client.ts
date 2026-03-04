import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL = ""; // Use relative paths to allow Next.js proxy/rewrites to handle CORS

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically inject JWT token from NextAuth
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.user && (session.user as any).accessToken) {
        config.headers.Authorization = `Bearer ${(session.user as any).accessToken}`;
    }
    return config;
});

export default apiClient;
