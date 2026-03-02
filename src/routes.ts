import { Router } from "express";
import authRouter from "./modules/auth/auth.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import tabibBotRouter from "./modules/tabib-bot/tabib-bot.routes.js";
import { authenticate, authorize } from "./middlewares/auth.middleware.js";
import doctorsRouter from "./modules/doctors/doctors.routes.js";
import consultationsRouter from "./modules/consultations/consultations.routes.js";
import { UserRole } from "./utils/constants.js";
import appointmentsRouter from "./modules/appointments/appointments.routes.js";
import pmdcVerificationRouter from "./modules/pmdc-verification/pmdc-verification.routes.js";

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', authenticate, usersRouter);
appRouter.use('/doctors', authenticate, doctorsRouter);
appRouter.use('/tabib-bot', authenticate, tabibBotRouter);
appRouter.use('/consultations', authenticate, authorize(UserRole.DOCTOR) ,consultationsRouter);
appRouter.use('/appointments', authenticate, appointmentsRouter);
appRouter.use('/pmdc-verification', authenticate, authorize([UserRole.DOCTOR, UserRole.ADMIN]), pmdcVerificationRouter);

export default appRouter;