import { Socket } from "socket.io";
import { logger } from "./utils/logger.js";
import { AIMessage, ToolMessage } from "langchain";
import { TabibBotService } from "./modules/tabib-bot/tabib-bot.service.js";
import { UsersService } from "./modules/users/users.service.js";

const socketUsersMap: Map<string, string> = new Map();
const tabibBotService = new TabibBotService();
const usersService = new UsersService();

export const onConnectionHandler = async (socket: Socket, userId: string) => {
    if (!userId) {
        socket.emit("error", "Missing userId in connection query");
        socket.disconnect(true);
        logger.warn(`Client disconnected due to missing userId: ${socket.id}`);
    }
    const user = await usersService.findById(userId);
    if (!user) {
        socket.emit("error", "Invalid userId provided");
        socket.disconnect(true);
        logger.warn(`Client disconnected due to invalid userId: ${socket.id} with userId: ${userId}`);
        return;
    }
    socketUsersMap.set(userId, socket.id);
    logger.info(`New client connected: ${socket.id} for user: ${userId}`);
}

export const onDisconnectHandler = (socket: Socket, userId: string) => {
    socketUsersMap.delete(userId);
    logger.info(`Client disconnected: ${socket.id} for user: ${userId}`);
}

export const onMessageHandler = async (socket: Socket, userId: string, query: string) => {
    const stream = await tabibBotService.chatResponse(query, userId);
    for await (const chunk of stream) {
        if (chunk.tools?.messages) {
            const lastMessage = chunk.tools.messages[chunk.tools.messages.length - 1];
            if (lastMessage instanceof ToolMessage) {
                const tool_name = lastMessage.name || "tool";
                socket.emit("toolCall", { toolName: tool_name });
            }
        }

        if (chunk.chatNode?.messages) {
            const lastMessage = chunk.chatNode.messages[chunk.chatNode.messages.length - 1];
            if (lastMessage instanceof AIMessage) {
                const content = lastMessage.content;
                if (content) {
                    socket.emit("response", { content: content });
                }
            }
        }
    }

}