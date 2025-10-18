import { Router } from "express";
import userRouter from "./user";
import adminRouter from "./admin";
import doctorRouter from "./doctor";

const appRouter = Router();

appRouter.use("/user", userRouter);
appRouter.use("/doctor", doctorRouter);
appRouter.use("/admin", adminRouter);

export default appRouter;