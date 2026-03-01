import { Router } from "express";
import { AppointmentsController } from "./appointments.controller";
import { authorize } from "../../middlewares/auth.middleware";
import { UserRole } from "../../utils/constants";

const appointmentsRouter = Router();
const appointmentController = new AppointmentsController();

appointmentsRouter.post("/", authorize(UserRole.USER), appointmentController.createController);
appointmentsRouter.get("/", appointmentController.listController);
appointmentsRouter.post("/:id/confirm", authorize(UserRole.DOCTOR), appointmentController.confirmController);
appointmentsRouter.post("/:id/cancel", authorize(UserRole.USER), appointmentController.cancelController);
appointmentsRouter.post("/:id/complete", authorize(UserRole.DOCTOR), appointmentController.completeController);

export default appointmentsRouter;