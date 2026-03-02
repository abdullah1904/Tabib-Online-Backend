import { Router } from "express";
import { AuthControllers } from "./auth.controller.js";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";


const authRouter = Router();
const authControllers = new AuthControllers();

authRouter.post("/register", uploadImageMiddleware('SIGN_UP'), authControllers.registerController);
authRouter.post("/login", authControllers.loginController);
authRouter.post("/send-otp", authControllers.sendOTPController);
authRouter.post("/verify-email", authControllers.verifyEmailController);
authRouter.post("/reset-password", authControllers.resetPasswordController);
authRouter.put("/change-password", authenticate, authControllers.changePasswordController);

export default authRouter;