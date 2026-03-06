import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}`

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

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            const data = error.response.data;
            if (data?.error === 'CONCURRENT_SESSION' || data?.error === 'FORBIDDEN_INACTIVE_USER') {
                if (typeof window !== 'undefined') {
                    // Dispatch custom event to show the SessionModal
                    window.dispatchEvent(new CustomEvent('show-session-modal', {
                        detail: {
                            message: data.message,
                            errorType: data.error
                        }
                    }));
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
