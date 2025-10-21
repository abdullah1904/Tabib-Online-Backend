import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { updatePersonalProfileDoctor, updateProfessionalProfileDoctor } from "../../controllers/doctor/profile.controller";

const doctorProfileRouter = Router();

doctorProfileRouter.put("/personal", uploadImageMiddleware('PROFILE_UPDATE'), updatePersonalProfileDoctor);
doctorProfileRouter.put("/professional", updateProfessionalProfileDoctor);

export default doctorProfileRouter;