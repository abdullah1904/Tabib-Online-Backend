import { Router } from "express";
import { UsersControllers } from "./users.controller";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { authorize } from "../../middlewares/auth.middleware";
import { UserRole } from "../../utils/constants";

const usersRouter = Router();
const usersControllers = new UsersControllers();

usersRouter.patch("/profile/personal", uploadImageMiddleware('PROFILE_UPDATE'), usersControllers.updateUserProfileController);
usersRouter.get("/profile/medical", authorize(UserRole.USER),usersControllers.getMedicalRecordController);
usersRouter.put("/profile/medical", authorize(UserRole.USER),usersControllers.updateMedicalRecordController);
usersRouter.get("/profile/professional", authorize(UserRole.DOCTOR),usersControllers.getProfessionalInfoController);
usersRouter.put("/profile/professional", authorize(UserRole.DOCTOR),usersControllers.updateProfessionalInfoController);
usersRouter.put("/profile/pmdc", authorize(UserRole.DOCTOR),usersControllers.updatePmdcInfoController);

export default usersRouter;