import { NextFunction, Request, Response } from "express";
import { DoctorsServices } from "./doctors.service";
import { HttpStatusCode } from "../../utils/constants";
import { reviewValidator } from "../../validators/doctors.validator";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST
} = HttpStatusCode;

export class DoctorsControllers {
    private doctorsService: DoctorsServices;
    constructor() {
        this.doctorsService = new DoctorsServices();
    }
    listRecommendedDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { doctors, recommendationReasoning } = await this.doctorsService.recommendDoctors(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "Doctors retrieved successfully",
                doctors,
                recommendationReasoning
            });
        }
        catch (error) {
            next(error);
        }
    }
    getDoctorByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const doctor = await this.doctorsService.findById(req.params.id.toString());
            res.status(HTTP_OK.code).json({
                message: "Doctor retrieved successfully",
                doctor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    createReviewController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = reviewValidator.validate(req.body);
            const { doctorId } = req.params;
            if (error) {
                res.status(HttpStatusCode.HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const review = await this.doctorsService.createReview({
                comment: value.comment,
                doctorId: doctorId.toString(),
                userId: req.user.id.toString(),
            });
            res.status(HTTP_OK.code).json({
                message: "Review created successfully",
                review
            });
        }
        catch (error) {
            const prismaError = error as { code?: string; meta?: { target?: string[] } };
            if (prismaError.code === 'P2002') {
                res.status(HTTP_BAD_REQUEST.code).json({ error: 'User has already reviewed this doctor' });
                return;
            }
            next(error);
        }
    }
    listReviewsController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviews = await this.doctorsService.getReviewsByDoctorId(req.user.id.toString());
            res.status(HTTP_OK.code).json({
                message: "Reviews retrieved successfully",
                reviews
            });
        }
        catch (error) {
            next(error);
        }
    }
}