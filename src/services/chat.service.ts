import apiClient from "@/lib/api-client";

export type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
    sqlQueries?: string;
    exportId?: string;
    exportTotal?: number;
    exportValor?: number;
};

export const chatService = {
    async sendMessage(message: string, history: Message[], sessionId?: string) {
        const response = await apiClient.post("/api/chat", {
            message,
            history,
            sessionId
        });
        return response.data;
    }
};
