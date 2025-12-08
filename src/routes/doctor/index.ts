import { Router } from "express";
import doctorAuthRouter from "./auth.routes";
import { authenticateDoctor } from "../../middlewares/auth.middleware";
import doctorProfileRouter from "./profile.routes";
import doctorServiceRouter from "./service.routes";
import doctorReviewRouter from "./review.routes";
import doctorVerificationApplicationRouter from "./verification-application.routes";
import appointmentRouter from "./appointment.routes";

const doctorRouter = Router();

doctorRouter.use("/auth", doctorAuthRouter);
doctorRouter.use("/profile", authenticateDoctor, doctorProfileRouter);
doctorRouter.use("/services", authenticateDoctor, doctorServiceRouter);
doctorRouter.use("/reviews", authenticateDoctor, doctorReviewRouter);
doctorRouter.use("/appointments", authenticateDoctor, appointmentRouter);
doctorRouter.use("/verification-applications", authenticateDoctor, doctorVerificationApplicationRouter);

export default doctorRouter;