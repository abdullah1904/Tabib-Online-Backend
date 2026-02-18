import { Router } from "express";
import { UsersControllers } from "./users.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";

const usersRouter = Router();
const usersControllers = new UsersControllers();

usersRouter.get("/profile", usersControllers.getUserProfileController);
usersRouter.patch("/profile", uploadImageMiddleware('PROFILE_UPDATE'), usersControllers.updateUserProfileController);
usersRouter.get("/medical-record", authenticateUser,usersControllers.getMedicalRecordController);
usersRouter.patch("/medical-record", authenticateUser,usersControllers.updateMedicalRecordController);

export default usersRouter;