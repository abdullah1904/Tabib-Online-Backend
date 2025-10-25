import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { UpdatePersonalProfileDoctor, UpdateProfessionalProfileDoctor } from "../../controllers/doctor/profile.controller";

const doctorProfileRouter = Router();

doctorProfileRouter.put("/personal", uploadImageMiddleware('PROFILE_UPDATE'), UpdatePersonalProfileDoctor);
doctorProfileRouter.put("/professional", UpdateProfessionalProfileDoctor);

export default doctorProfileRouter;