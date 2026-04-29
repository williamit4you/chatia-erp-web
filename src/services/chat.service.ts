import apiClient from "@/lib/api-client";

export type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
    sqlQueries?: string;
    exportId?: string;
    exportTotal?: number;
    exportValor?: number;
    metricsTotal?: number;
    metricsValor?: number;
    responseType?: string;
    sections?: ResponseSection[];
    suggestions?: string[];
    rightRail?: ChatRightRail;
};

export type ChatRightRailItem = {
    label: string;
    action?: string;
    metadata?: string;
};

export type ChatRightRailInsight = {
    title: string;
    description: string;
    ctaLabel?: string;
    ctaAction?: string;
    tone?: "neutral" | "positive" | "warning" | "danger";
};

export type ChatRightRail = {
    suggestions: ChatRightRailItem[];
    insights: ChatRightRailInsight[];
    favoriteQuestions: ChatRightRailItem[];
};

export type ResponseMetric = {
    label: string;
    value: string;
    tone?: "neutral" | "positive" | "warning" | "danger";
};

export type ResponseListItem = {
    title: string;
    subtitle?: string;
    value?: string;
    tone?: "neutral" | "positive" | "warning" | "danger";
};

export type ResponseAction = {
    label: string;
    variant?: "primary" | "secondary";
};

export type ResponseSection =
    | {
          type: "summary";
          title?: string;
          content: string;
      }
    | {
          type: "metrics";
          title?: string;
          items: ResponseMetric[];
      }
    | {
          type: "list";
          title?: string;
          items: ResponseListItem[];
      }
    | {
          type: "recommendation";
          title?: string;
          content: string;
      }
    | {
          type: "actions";
          title?: string;
          items: ResponseAction[];
      };

export type ChatResponsePayload = {
    reply: string;
    sessionId?: string;
    sqlQueries?: string;
    contextUsageScore?: number;
    exportId?: string;
    exportTotalLinhas?: number;
    exportValorTotal?: number;
    metricsTotalLinhas?: number;
    metricsValorTotal?: number;
    responseType?: string;
    sections?: ResponseSection[];
    suggestions?: string[];
    rightRail?: ChatRightRail;
};

export const chatService = {
    async sendMessage(message: string, history: Message[], sessionId?: string) {
        const response = await apiClient.post("/api/chat", {
            message,
            history,
            sessionId
        });
        return response.data as ChatResponsePayload;
    }
};
