import { Router } from "express";
import { AppointmentsController } from "./appointments.controller";

const appointmentsRouter = Router();
const appointmentController = new AppointmentsController();

appointmentsRouter.post("/", appointmentController.createController);
// appointmentsRouter.get("/", appointmentController.listController);

export default appointmentsRouter;