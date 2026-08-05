import type { InterAgentMessage } from "./types.ts";

export class CommunicationProtocol {
    private messageBus: InterAgentMessage[] = [];

    sendMessage(message: InterAgentMessage): void {
        this.messageBus.push(message);
    }

    getMessagesByCorrelation(correlationId: string): InterAgentMessage[] {
        return this.messageBus.filter((m) => m.correlationId === correlationId);
    }

    createMessage(
        correlationId: string,
        senderId: string,
        recipientIds: string[],
        intent: InterAgentMessage["intent"],
        content: string,
        confidenceScore: number = 0.9,
        evidence: string[] = [],
        priority: InterAgentMessage["priority"] = "medium"
    ): InterAgentMessage {
        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            correlationId,
            senderId,
            recipientIds,
            intent,
            confidenceScore,
            priority,
            evidence,
            content,
            timestamp: Date.now(),
        };
    }
}
