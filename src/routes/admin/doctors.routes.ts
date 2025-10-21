import { Router } from "express";
import { ActivateDoctorAdmin, BannedDoctorAdmin, GetDoctorAdmin, ListDoctorsAdmin, SuspendDoctorAdmin } from "../../controllers/admin/doctors.controller";
import { AuthorizeSuperOrWriteAdmin } from "../../middlewares/auth.middleware";

const adminDoctorsRouter = Router();

adminDoctorsRouter.get("/", ListDoctorsAdmin);
adminDoctorsRouter.get("/:id", GetDoctorAdmin);
adminDoctorsRouter.patch("/:id/activate", AuthorizeSuperOrWriteAdmin, ActivateDoctorAdmin);
adminDoctorsRouter.patch("/:id/suspend", AuthorizeSuperOrWriteAdmin, SuspendDoctorAdmin);
adminDoctorsRouter.patch("/:id/ban", AuthorizeSuperOrWriteAdmin, BannedDoctorAdmin);

export default adminDoctorsRouter;