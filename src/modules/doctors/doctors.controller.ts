import { NextFunction, Request, Response } from "express";
import { DoctorsServices } from "./doctors.service";
import { HttpStatusCode } from "../../utils/constants";

const {
    HTTP_OK,
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
}