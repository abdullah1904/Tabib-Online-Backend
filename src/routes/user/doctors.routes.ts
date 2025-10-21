import { Router } from "express";
import { GetDoctorUser, ListDoctorsUser } from "../../controllers/user/doctors.controller";

const userDoctorsRouter = Router();

userDoctorsRouter.get("/", ListDoctorsUser);
userDoctorsRouter.get("/:id", GetDoctorUser);

export default userDoctorsRouter;