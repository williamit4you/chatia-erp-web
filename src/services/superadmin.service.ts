import apiClient from "@/lib/api-client";

export const superAdminService = {
    async testDb() {
        const response = await apiClient.get("/api/superadmin/test-db");
        return response.data;
    },
    async getTenants() {
        const response = await apiClient.get("/api/superadmin/tenants");
        return response.data;
    },
    async createTenant(data: any) {
        const response = await apiClient.post("/api/register", data);
        return response.data;
    },
    async updateTenant(tenantId: string, data: any) {
        const response = await apiClient.put(`/api/superadmin/tenants/${tenantId}`, data);
        return response.data;
    },
    async createTenantUser(tenantId: string, data: any) {
        const response = await apiClient.post(`/api/superadmin/tenants/${tenantId}/users`, data);
        return response.data;
    },
    async updateTenantUser(tenantId: string, userId: string, data: any) {
        const response = await apiClient.put(`/api/superadmin/tenants/${tenantId}/users/${userId}`, data);
        return response.data;
    }
};
