import axios from "axios";

const publicApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217",
  headers: {
    "Content-Type": "application/json",
  },
});

export const passwordService = {
  async forgotPassword(email: string) {
    const response = await publicApiClient.post("/api/auth/forgot-password", { email });
    return response.data;
  },
  async validateResetToken(token: string) {
    const response = await publicApiClient.get("/api/auth/reset-password/validate", {
      params: { token },
    });
    return response.data;
  },
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    const response = await publicApiClient.post("/api/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

