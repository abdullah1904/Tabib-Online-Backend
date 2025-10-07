import { Router } from "express";
import { LoginUser, SignupUser } from "../../controllers/user/auth.controller";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";

const userAuthRouter = Router();

userAuthRouter.post("/signup", uploadImageMiddleware('SIGN_UP'), SignupUser);
userAuthRouter.post("/login", LoginUser);

export default userAuthRouter;