import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { updateProfileAdmin } from "../../controllers/admin/profile.controller";

const adminProfileRouter = Router();

adminProfileRouter.put("/",uploadImageMiddleware('PROFILE_UPDATE'), updateProfileAdmin);

export default adminProfileRouter;