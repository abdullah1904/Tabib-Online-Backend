import { Router } from "express";
import { UsersControllers } from "./users.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";

const usersRouter = Router();
const usersControllers = new UsersControllers();

usersRouter.patch("/profile/personal", uploadImageMiddleware('PROFILE_UPDATE'), usersControllers.updateUserProfileController);
usersRouter.get("/profile/medical", authenticateUser,usersControllers.getMedicalRecordController);
usersRouter.put("/profile/medical", authenticateUser,usersControllers.updateMedicalRecordController);

export default usersRouter;