import { Router } from "express";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import tabibBotRouter from "./modules/tabib-bot/tabib-bot.routes";
import { authenticate } from "./middlewares/auth.middleware";
import doctorsRouter from "./modules/doctors/doctors.routes";

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', authenticate, usersRouter);
appRouter.use('/doctors', authenticate, doctorsRouter);
appRouter.use('/tabib-bot', authenticate, tabibBotRouter);

export default appRouter;