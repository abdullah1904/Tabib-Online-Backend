import { NextFunction, Request, Response } from "express";
import { TabibBotService } from "./tabib-bot.service";
import { HttpStatusCode } from "../../utils/constants";

const {
    HTTP_OK
} = HttpStatusCode;

export class TabibBotControllers {
    private tabibBotService: TabibBotService;
    constructor() {
        this.tabibBotService = new TabibBotService();
    }
    getHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const messages = await this.tabibBotService.chatHistory(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "Chat history retrieved successfully",
                messages,
            });
            return;
        } catch (error) {
            next(error);
        }
    }
}