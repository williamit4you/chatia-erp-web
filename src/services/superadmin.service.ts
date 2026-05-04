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
    },
    async getTenantSqlLogs(tenantId: string, filters?: { userId?: string; startDate?: string; endDate?: string }) {
        const params = new URLSearchParams();

        if (filters?.userId) params.append("userId", filters.userId);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);

        const queryString = params.toString();
        const response = await apiClient.get(
            `/api/superadmin/tenants/${tenantId}/sql-logs${queryString ? `?${queryString}` : ""}`
        );
        return response.data;
    }
};
