import { Router } from "express";
import adminAuthRouter from "./auth.routes";
import adminUsersRouter from "./users.routes";
import { authenticateAdmin } from "../../middlewares/auth.middleware";

const adminRouter = Router();

adminRouter.use("/auth", adminAuthRouter);
adminRouter.use("/users", authenticateAdmin, adminUsersRouter);


export default adminRouter;