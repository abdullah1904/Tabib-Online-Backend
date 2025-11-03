import { Router } from "express";
import { ListReviewsDoctor } from "../../controllers/doctor/review.controller";

const doctorReviewRouter = Router();

doctorReviewRouter.get("/", ListReviewsDoctor);

export default doctorReviewRouter;