import { Request, Response, Router } from "express";
import { CreateDoctorAppointmentUser, GetDoctorUser, ListDoctorAppointmentsUser, ListDoctorsUser, ReviewDoctorUser } from "../../controllers/user/doctors.controller";

const userDoctorsRouter = Router();

userDoctorsRouter.get("/", ListDoctorsUser);
userDoctorsRouter.get("/appointments", ListDoctorAppointmentsUser);
userDoctorsRouter.get("/:id", GetDoctorUser);
userDoctorsRouter.post("/:id/review", ReviewDoctorUser);
userDoctorsRouter.post("/:id/services/:serviceId/appointments", CreateDoctorAppointmentUser);

export default userDoctorsRouter;