import { Router } from "express";
import { ActivateUser, BannedUser, GetUser, ListUsers, SuspendUser } from "../../controllers/admin/users.controller";
import { AuthorizeSuperOrWriteAdmin } from "../../middlewares/auth.middleware";

const adminUsersRouter = Router();

adminUsersRouter.get("/", ListUsers);
adminUsersRouter.get("/:id", GetUser);
adminUsersRouter.patch("/:id/activate", AuthorizeSuperOrWriteAdmin, ActivateUser);
adminUsersRouter.patch("/:id/suspend", AuthorizeSuperOrWriteAdmin, SuspendUser);
adminUsersRouter.patch("/:id/ban", AuthorizeSuperOrWriteAdmin, BannedUser);

export default adminUsersRouter;