import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../../utils/constants";
import { chatHistoryService } from "../../services/ai-servies/chatbot.service";

const {
    HTTP_OK,
} = HttpStatusCode;

const MessagesHistoryUser = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const {id: userId} = req.user;
        const messages = await chatHistoryService(String(userId));
        res.status(HTTP_OK.code).json({
            messages
        });
    }
    catch (error) {
        next(error);
    }
}

export {
    MessagesHistoryUser
}