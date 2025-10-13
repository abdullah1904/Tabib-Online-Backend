import { Router } from "express";
import adminAuthRouter from "./auth.routes";
import adminUsersRouter from "./users.routes";
import { authenticateAdmin } from "../../middlewares/auth.middleware";
import adminProfileRouter from "./profile.routes";

const adminRouter = Router();

adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/users", authenticateAdmin, adminUsersRouter);
adminRouter.use("/profile", authenticateAdmin, adminProfileRouter);


export default adminRouter;