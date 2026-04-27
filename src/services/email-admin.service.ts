import apiClient from "@/lib/api-client";

export const emailAdminService = {
  async getSettings() {
    const response = await apiClient.get("/api/email-settings");
    return response.data;
  },
  async saveSettings(data: any, id?: string) {
    const response = id
      ? await apiClient.put(`/api/email-settings/${id}`, data)
      : await apiClient.post("/api/email-settings", data);
    return response.data;
  },
  async testSettings(id: string, toEmail: string) {
    const response = await apiClient.post(`/api/email-settings/${id}/test`, { toEmail });
    return response.data;
  },
  async getTemplates() {
    const response = await apiClient.get("/api/email-templates");
    return response.data;
  },
  async saveTemplate(data: any, id?: string) {
    const response = id
      ? await apiClient.put(`/api/email-templates/${id}`, data)
      : await apiClient.post("/api/email-templates", data);
    return response.data;
  },
  async getLogs(params: any) {
    const response = await apiClient.get("/api/email-logs", { params });
    return response.data;
  },
};

