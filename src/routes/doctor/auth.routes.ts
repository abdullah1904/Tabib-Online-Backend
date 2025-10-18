import { Router } from "express";
import { ChangePasswordDoctor, ForgotPasswordDoctor, LoginDoctor, ResetPasswordDoctor, SendOTPDoctor, SignupDoctor, VerifyDoctor } from "../../controllers/doctor/auth.controller";
import { uploadMultipleImagesMiddleware } from "../../middlewares/upload.middleware";
import { authenticateDoctor } from "../../middlewares/auth.middleware";

const doctorAuthRouter = Router();

doctorAuthRouter.post("/send-otp", SendOTPDoctor);
doctorAuthRouter.post("/signup", uploadMultipleImagesMiddleware('DOCTOR_SIGNUP'), SignupDoctor);
doctorAuthRouter.post("/verify-account", VerifyDoctor);
doctorAuthRouter.post("/login", LoginDoctor);
doctorAuthRouter.post("/forgot-password", ForgotPasswordDoctor);
doctorAuthRouter.post("/reset-password", ResetPasswordDoctor);
doctorAuthRouter.put("/change-password", authenticateDoctor, ChangePasswordDoctor);

export default doctorAuthRouter;