import { NextFunction, Request, Response } from "express";
import { ConsultationsService } from "./consultations.service";
import { consultationValidator } from "../../validators/consultation.validator";
import { HttpStatusCode } from "../../utils/constants";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

export class ConsultationsController {
    private consultationsService: ConsultationsService;
    constructor() {
        this.consultationsService = new ConsultationsService();
    }
    createController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = consultationValidator.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const consultation = await this.consultationsService.create({
                title: value.title,
                type: value.type,
                duration: value.duration,
                price: value.price,
                time: new Date(`1970-01-01T${value.time}:00Z`),
                consultationSlots: {
                    create: value.availableDays.map((day: number) => ({
                        dayOfWeek: day
                    }))
                },
                location: value.location,
                allowCustom: value.allowCustom,
                doctor: { connect: { id: req.user.id.toString() } }
            });
            res.status(HTTP_CREATED.code).json({
                message: "Consultation created successfully",
                consultation
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    listController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const consultations = await this.consultationsService.list(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "Consultations retrieved successfully",
                consultations
            });
        } catch (error) {
            next(error);
        }
    }
    updateController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { error, value } = consultationValidator.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const consultation = await this.consultationsService.update(id.toString(), {
                title: value.title,
                type: value.type,
                duration: value.duration,
                price: value.price,
                time: new Date(`1970-01-01T${value.time}:00Z`),
                location: value.location,
                allowCustom: value.allowCustom,
                consultationSlots: {
                    deleteMany: {},
                    create: value.availableDays.map((day: number) => ({
                        dayOfWeek: day
                    }))
                }
            });
            res.status(HTTP_OK.code).json({
                message: "Consultation updated successfully",
                consultation
            });
        }   
        catch (error) {
            next(error);
        }
    }
    removeController = async (req: Request, res: Response, next: NextFunction) => {
        try {            const { id } = req.params;
            await this.consultationsService.remove(id.toString());
            res.status(HTTP_OK.code).json({
                message: "Consultation removed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }

}