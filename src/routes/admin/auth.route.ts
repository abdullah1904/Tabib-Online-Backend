import { Router } from "express";
import { LoginAdmin, ForgotPasswordAdmin, ResetPasswordAdmin, ChangePasswordAdmin } from "../../controllers/admin/auth.controller";
import { authenticateAdmin } from "../../middlewares/auth.middleware";

const adminAuthRouter = Router();

adminAuthRouter.post("/login", LoginAdmin);
adminAuthRouter.post("/forgot-password", ForgotPasswordAdmin);
adminAuthRouter.post("/reset-password", ResetPasswordAdmin);
adminAuthRouter.put("/change-password", authenticateAdmin, ChangePasswordAdmin);

export default adminAuthRouter;