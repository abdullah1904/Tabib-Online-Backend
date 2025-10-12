import { Router } from "express";
import { ChangePasswordUser, ForgotPasswordUser, LoginUser, ResetPasswordUser, SendOTPUser, SignupUser, VerifyUser } from "../../controllers/user/auth.controller";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { authenticateUser } from "../../middlewares/auth.middleware";

const userAuthRouter = Router();

userAuthRouter.post("/send-otp", SendOTPUser);
userAuthRouter.post("/signup", uploadImageMiddleware('SIGN_UP'), SignupUser);
userAuthRouter.post("/verify-account", VerifyUser);
userAuthRouter.post("/login", LoginUser);
userAuthRouter.post("/forgot-password", ForgotPasswordUser);
userAuthRouter.post("/reset-password", ResetPasswordUser);
userAuthRouter.put("/change-password", authenticateUser, ChangePasswordUser);

export default userAuthRouter;