import { Router } from "express";
import adminAuthRouter from "./auth.route";

const adminRouter = Router();

adminRouter.use("/auth", adminAuthRouter);


export default adminRouter;