import { Router } from "express";
import { CreateVerificationApplicationDoctor, ListVerificationApplicationsDoctor } from "../../controllers/doctor/verification-application.controller";

const doctorVerificationApplicationRouter = Router();

doctorVerificationApplicationRouter.post("/", CreateVerificationApplicationDoctor);
doctorVerificationApplicationRouter.get("/", ListVerificationApplicationsDoctor);

export default doctorVerificationApplicationRouter;