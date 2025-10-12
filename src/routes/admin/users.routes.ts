import { Router } from "express";
import { GetUser, ListUsers } from "../../controllers/admin/users.controller";

const adminUsersRouter = Router();

adminUsersRouter.get("/", ListUsers);
adminUsersRouter.get("/:id", GetUser);

export default adminUsersRouter;