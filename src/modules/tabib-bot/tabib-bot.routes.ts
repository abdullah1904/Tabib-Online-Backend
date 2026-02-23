import { Router } from "express";
import { TabibBotControllers } from "./tabib-bot.controller";


const tabibBotRouter = Router();
const tabibBotControllers = new TabibBotControllers();

tabibBotRouter.get("/history", tabibBotControllers.getHistory);

export default tabibBotRouter;