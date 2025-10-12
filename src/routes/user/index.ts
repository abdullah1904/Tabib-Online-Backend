import { Router } from "express";
import userAuthRouter from "./auth.routes";

const userRouter = Router();

userRouter.use("/auth", userAuthRouter);

export default userRouter;