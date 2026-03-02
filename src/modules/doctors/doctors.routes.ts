import { Router } from "express";
import { DoctorsControllers } from "./doctors.controller.js";
import { authorize } from "../../middlewares/auth.middleware.js";
import { UserRole } from "../../utils/constants.js";

const doctorsRouter = Router();
const doctorsControllers = new DoctorsControllers();


doctorsRouter.get("/recommend",authorize(UserRole.USER), doctorsControllers.listRecommendedDoctorsController);
doctorsRouter.get("/reviews", authorize(UserRole.DOCTOR),doctorsControllers.listReviewsController);
doctorsRouter.get("/:id", doctorsControllers.getDoctorByIdController);
doctorsRouter.post("/:doctorId/reviews", authorize(UserRole.USER), doctorsControllers.createReviewController);


export default doctorsRouter;