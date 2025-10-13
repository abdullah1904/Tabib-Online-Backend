import { Router } from "express";
import { ActivateUser, BannedUser, GetUser, ListUsers, SuspendUser } from "../../controllers/admin/users.controller";
import { AuthorizeSuperOrReadAdmin } from "../../middlewares/auth.middleware";

const adminUsersRouter = Router();

adminUsersRouter.get("/", ListUsers);
adminUsersRouter.get("/:id", GetUser);
adminUsersRouter.patch("/:id/activate", AuthorizeSuperOrReadAdmin, ActivateUser);
adminUsersRouter.patch("/:id/suspend", AuthorizeSuperOrReadAdmin, SuspendUser);
adminUsersRouter.patch("/:id/ban", AuthorizeSuperOrReadAdmin, BannedUser);

export default adminUsersRouter;