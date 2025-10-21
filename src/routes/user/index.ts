import { Router } from "express";
import userAuthRouter from "./auth.routes";
import { authenticateUser } from "../../middlewares/auth.middleware";
import userDoctorsRouter from "./doctors.routes";

const userRouter = Router();

userRouter.use("/auth", userAuthRouter);
userRouter.use("/doctors", authenticateUser, userDoctorsRouter);

export default userRouter;