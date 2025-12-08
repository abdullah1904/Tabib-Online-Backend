import { Router } from "express";
import { ApproveAppointmentDoctor, ListAppointmentsDoctor } from "../../controllers/doctor/appointment.controller";

const appointmentRouter = Router();

appointmentRouter.get("/", ListAppointmentsDoctor);
appointmentRouter.put("/:id/approve", ApproveAppointmentDoctor);

export default appointmentRouter;