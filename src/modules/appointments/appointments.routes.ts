import { Router } from "express";
import { AppointmentsController } from "./appointments.controller.js";
import { authorize } from "../../middlewares/auth.middleware.js";
import { UserRole } from "../../utils/constants.js";

const appointmentsRouter = Router();
const appointmentController = new AppointmentsController();

appointmentsRouter.post("/", authorize(UserRole.USER), appointmentController.createController);
appointmentsRouter.get("/", appointmentController.listController);
appointmentsRouter.patch("/:id/confirm", authorize(UserRole.DOCTOR), appointmentController.confirmController);
appointmentsRouter.patch("/:id/cancel", appointmentController.cancelController);
appointmentsRouter.patch("/:id/complete", authorize(UserRole.DOCTOR), appointmentController.completeController);

export default appointmentsRouter;