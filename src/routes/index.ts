import { Router } from "express";
import userRouter from "./user";
import adminRouter from "./admin";

const appRouter = Router();

appRouter.use("/admin", adminRouter);
appRouter.use("/user", userRouter);

export default appRouter;