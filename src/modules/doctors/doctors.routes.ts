import { Router } from "express";
import { DoctorsControllers } from "./doctors.controller";
import { authorize } from "../../middlewares/auth.middleware";
import { UserRole } from "../../utils/constants";

const doctorsRouter = Router();
const doctorsControllers = new DoctorsControllers();


doctorsRouter.get("/recommend",authorize(UserRole.USER), doctorsControllers.listRecommendedDoctorsController);


export default doctorsRouter;