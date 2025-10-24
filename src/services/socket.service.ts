import { Socket } from "socket.io";
import { chatServiceStream } from "./ai-servies/chatbot.service";
import { logger } from "../utils/logger";
import { removeThinking } from "../utils";

const socketUsersMap: Map<string, string> = new Map();

export const onConnectionHandler = (socket: Socket, userId: string) => {
    if (userId) {
        socketUsersMap.set(userId, socket.id);
        logger.info(`New client connected: ${socket.id} for user: ${userId}`);
    }
    else {
        socket.emit("error", "Missing userId in connection query");
        socket.disconnect(true);
        logger.warn(`Client disconnected due to missing userId: ${socket.id}`);
    }
}

export const onDisconnectHandler = (socket: Socket, userId: string) => {
    socketUsersMap.delete(userId);
    logger.info(`Client disconnected: ${socket.id} for user: ${userId}`);
}

export const onMessageHandler = async (socket: Socket, userId: string, query: string) => {
    const stream = await chatServiceStream(query, userId);
    for await (const chunk of stream) {
        const content = chunk.chatNode?.messages[chunk.chatNode.messages.length - 1].content;
        socket.emit("response", { content: removeThinking(content as string) });
    }
}