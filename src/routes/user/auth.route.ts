import { Router } from "express";
import { SignupUser } from "../../controllers/user/auth.controller";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";

const userAuthRouter = Router();

userAuthRouter.post("/signup", uploadImageMiddleware('SIGN_UP'), SignupUser);

export default userAuthRouter;