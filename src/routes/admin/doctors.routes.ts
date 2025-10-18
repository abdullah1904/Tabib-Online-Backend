import { Router } from "express";
import { ActivateDoctor, BannedDoctor, GetDoctor, ListDoctors, SuspendDoctor } from "../../controllers/admin/doctors.controller";
import { AuthorizeSuperOrWriteAdmin } from "../../middlewares/auth.middleware";

const adminDoctorsRouter = Router();

adminDoctorsRouter.get("/", ListDoctors);
adminDoctorsRouter.get("/:id", GetDoctor);
adminDoctorsRouter.patch("/:id/activate", AuthorizeSuperOrWriteAdmin, ActivateDoctor);
adminDoctorsRouter.patch("/:id/suspend", AuthorizeSuperOrWriteAdmin, SuspendDoctor);
adminDoctorsRouter.patch("/:id/ban", AuthorizeSuperOrWriteAdmin, BannedDoctor);

export default adminDoctorsRouter;