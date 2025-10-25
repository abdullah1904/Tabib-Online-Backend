import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { UpdatePersonalProfileUser, UpdateMedicalRecordUser, GetMedicalRecordUser } from "../../controllers/user/profile.controller";

const userProfileRouter = Router();

userProfileRouter.put("/personal", uploadImageMiddleware('PROFILE_UPDATE'), UpdatePersonalProfileUser);
userProfileRouter.get("/medical", GetMedicalRecordUser);
userProfileRouter.put("/medical", UpdateMedicalRecordUser);

export default userProfileRouter;