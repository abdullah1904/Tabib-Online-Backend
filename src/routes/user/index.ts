import { Router } from "express";
import userAuthRouter from "./auth.route";

const userRouter = Router();

userRouter.use("/auth", userAuthRouter);

export default userRouter;