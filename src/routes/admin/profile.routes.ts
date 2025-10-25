import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { UpdateProfileAdmin } from "../../controllers/admin/profile.controller";

const adminProfileRouter = Router();

adminProfileRouter.put("/",uploadImageMiddleware('PROFILE_UPDATE'), UpdateProfileAdmin);

export default adminProfileRouter;