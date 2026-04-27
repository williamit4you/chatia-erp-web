import apiClient from "@/lib/api-client";

export const passwordService = {
  async forgotPassword(email: string) {
    const response = await apiClient.post("/api/auth/forgot-password", { email });
    return response.data;
  },
  async validateResetToken(token: string) {
    const response = await apiClient.get("/api/auth/reset-password/validate", {
      params: { token },
    });
    return response.data;
  },
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    const response = await apiClient.post("/api/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

