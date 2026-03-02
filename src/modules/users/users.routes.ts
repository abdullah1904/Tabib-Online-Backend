import { Router } from "express";
import { UsersControllers } from "./users.controller.js";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware.js";
import { authorize } from "../../middlewares/auth.middleware.js";
import { UserRole } from "../../utils/constants.js";

const usersRouter = Router();
const usersControllers = new UsersControllers();

usersRouter.patch("/profile/personal", uploadImageMiddleware('PROFILE_UPDATE'), usersControllers.updateUserProfileController);
usersRouter.get("/profile/medical", authorize(UserRole.USER),usersControllers.getMedicalRecordController);
usersRouter.put("/profile/medical", authorize(UserRole.USER),usersControllers.updateMedicalRecordController);
usersRouter.get("/profile/professional", authorize(UserRole.DOCTOR),usersControllers.getProfessionalInfoController);
usersRouter.put("/profile/professional", authorize(UserRole.DOCTOR),usersControllers.updateProfessionalInfoController);
usersRouter.put("/profile/pmdc", authorize(UserRole.DOCTOR),usersControllers.updatePmdcInfoController);
usersRouter.get("/profile/wallet/checkouts", authorize(UserRole.USER), usersControllers.listCheckoutsController);
usersRouter.post("/profile/wallet/checkouts", authorize(UserRole.USER), usersControllers.createCheckoutController);

export default usersRouter;