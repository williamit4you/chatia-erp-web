import apiClient from "@/lib/api-client";

export const adminService = {
    async getSettings() {
        const response = await apiClient.get("/api/admin/settings");
        return response.data;
    },
    async updateSettings(data: any) {
        const response = await apiClient.post("/api/admin/settings", data);
        return response.data;
    },
    async getUsers() {
        const response = await apiClient.get("/api/admin/users");
        return response.data;
    },
    async createUser(data: any) {
        const response = await apiClient.post("/api/admin/users", data);
        return response.data;
    }
};
