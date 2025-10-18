import { Router } from "express";
import doctorAuthRouter from "./auth.routes";

const doctorRouter = Router();

doctorRouter.use("/auth", doctorAuthRouter);

export default doctorRouter;