import { Router } from "express";
import { MessagesHistoryUser } from "../../controllers/user/chatbot.controller";

const userChatbotRouter = Router();

userChatbotRouter.get("/history", MessagesHistoryUser);

export default userChatbotRouter;