import { NextFunction, Request, Response } from "express";
import { AppointmentsService } from "./appointments.service";
import { appointmentValidator } from "../../validators/appointments.validator";
import { HttpStatusCode } from "../../utils/constants";

const {
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
            const {error, value} = appointmentValidator.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const appointment = await this.appointmentsService.create({
                ...value,
                userId
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
}