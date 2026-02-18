import { Router } from "express";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware";
import { AuthControllers } from "./auth.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const authRouter = Router();
const authControllers = new AuthControllers();

authRouter.post("/register", uploadImageMiddleware('SIGN_UP'), authControllers.registerController);
authRouter.post("/login", authControllers.loginController);
authRouter.post("/send-otp", authControllers.sendOTPController);
authRouter.post("/verify-email", authControllers.verifyEmailController);
authRouter.post("/reset-password", authControllers.resetPasswordController);
authRouter.put("/change-password", authenticateUser, authControllers.changePasswordController);

export default authRouter;