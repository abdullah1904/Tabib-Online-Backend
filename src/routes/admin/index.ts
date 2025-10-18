import { Router } from "express";
import adminAuthRouter from "./auth.routes";
import adminUsersRouter from "./users.routes";
import { authenticateAdmin } from "../../middlewares/auth.middleware";
import adminProfileRouter from "./profile.routes";
import adminDoctorsRouter from "./doctors.routes";

const adminRouter = Router();

adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/profile", authenticateAdmin, adminProfileRouter);
adminRouter.use("/users", authenticateAdmin, adminUsersRouter);
adminRouter.use("/doctors", authenticateAdmin, adminDoctorsRouter);


export default adminRouter;