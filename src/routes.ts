import { Router } from "express";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import tabibBotRouter from "./modules/tabib-bot/tabib-bot.routes";
import { authenticateUser } from "./middlewares/auth.middleware";

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', authenticateUser, usersRouter);
appRouter.use('/tabib-bot', authenticateUser, tabibBotRouter);

export default appRouter;