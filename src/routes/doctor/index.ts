import { Router } from "express";
import doctorAuthRouter from "./auth.routes";
import { authenticateDoctor } from "../../middlewares/auth.middleware";
import doctorProfileRouter from "./profile.routes";

const doctorRouter = Router();

doctorRouter.use("/auth", doctorAuthRouter);
doctorRouter.use("/profile", authenticateDoctor, doctorProfileRouter);

export default doctorRouter;