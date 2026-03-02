import { NextFunction, Request, Response } from "express";
import { AppointmentsService } from "./appointments.service.js";
import { appointmentValidator } from "../../validators/appointments.validator.js";
import { HttpStatusCode } from "../../utils/constants.js";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

export class AppointmentsController {
    private appointmentsService: AppointmentsService;
    constructor() {
        this.appointmentsService = new AppointmentsService();
    }
    createController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { error, value } = appointmentValidator.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const { consultationId, doctorId, ...rest } = value;

            const appointment = await this.appointmentsService.create({
                ...rest,
                user: {
                    connect: { id: userId }
                },
                doctor: {
                    connect: { id: doctorId }
                },
                consultation: {
                    connect: { id: consultationId }
                }
            });
            res.status(HTTP_CREATED.code).json({
                message: "Appointment created successfully",
                appointment
            });
        }
        catch (error) {
            next(error);
        }
    }
    listController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const appointments = await this.appointmentsService.list(userId);
            res.status(HTTP_OK.code).json({
                message: "Appointments retrieved successfully",
                appointments
            });
        }
        catch (error) {
            next(error);
        }
    }
    confirmController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: appointmentId } = req.params;
            await this.appointmentsService.confirm(appointmentId.toString());
            res.status(HTTP_OK.code).json({
                message: "Appointment confirmed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    cancelController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: appointmentId } = req.params;
            const { id: userId } = req.user;
            await this.appointmentsService.cancel(appointmentId.toString());
            res.status(HTTP_OK.code).json({
                message: "Appointment cancelled successfully",

            });
        }
        catch (error) {
            next(error);
        }
    }
    completeController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: appointmentId } = req.params;
            await this.appointmentsService.complete(appointmentId.toString());
            res.status(HTTP_OK.code).json({
                message: "Appointment completed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}