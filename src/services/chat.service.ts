import apiClient from "@/lib/api-client";

export type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
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
