import { Router } from "express";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import tabibBotRouter from "./modules/tabib-bot/tabib-bot.routes";
import { authenticate, authorize } from "./middlewares/auth.middleware";
import doctorsRouter from "./modules/doctors/doctors.routes";
import consultationsRouter from "./modules/consultations/consultations.routes";
import { UserRole } from "./utils/constants";
import appointmentsRouter from "./modules/appointments/appointments.routes";
import pmdcVerificationRouter from "./modules/pmdc-verification/pmdc-verification.routes";

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', authenticate, usersRouter);
appRouter.use('/doctors', authenticate, doctorsRouter);
appRouter.use('/tabib-bot', authenticate, tabibBotRouter);
appRouter.use('/consultations', authenticate, authorize(UserRole.DOCTOR) ,consultationsRouter);
appRouter.use('/appointments', authenticate, appointmentsRouter);
appRouter.use('/pmdc-verification', authenticate, authorize([UserRole.DOCTOR, UserRole.ADMIN]), pmdcVerificationRouter);

export default appRouter;