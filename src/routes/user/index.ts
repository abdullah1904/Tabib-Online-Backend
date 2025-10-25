import { Router } from "express";
import userAuthRouter from "./auth.routes";
import { authenticateUser } from "../../middlewares/auth.middleware";
import userDoctorsRouter from "./doctors.routes";
import userChatbotRouter from "./chatbot.routes";
import userProfileRouter from "./profile.routes";

const userRouter = Router();

userRouter.use("/auth", userAuthRouter);
userRouter.use("/doctors", authenticateUser, userDoctorsRouter);
userRouter.use("/chatbot", authenticateUser, userChatbotRouter);
userRouter.use("/profile", authenticateUser, userProfileRouter);

export default userRouter;