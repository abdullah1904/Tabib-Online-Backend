import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { HTTPError } from "../../types";
import { AppointmentStatus, HttpStatusCode } from "../../utils/constants";
import { ConsultationsService } from "../consultations/consultations.service";
import { UsersService } from "../users/users.service";

const {
    HTTP_NOT_FOUND,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

export class AppointmentsService {
    private userService: UsersService;
    private consultationsService: ConsultationsService;
    constructor() {
        this.userService = new UsersService();
        this.consultationsService = new ConsultationsService();
    }
    async create(data: Prisma.AppointmentsCreateInput) {
        if (!data.consultation?.connect?.id) {
            throw new HTTPError("Consultation ID is required", HTTP_BAD_REQUEST.code);
        }

        const [doctor, user, consultation] = await Promise.all([
            this.userService.findById((data.doctor as any).connect?.id),
            this.userService.findById((data.user as any).connect?.id),
            this.consultationsService.findById(data.consultation.connect.id)
        ]);
        if (!doctor) {
            throw new HTTPError("Doctor not found", HTTP_NOT_FOUND.code);
        }
        if (!user) {
            throw new HTTPError("User not found", HTTP_NOT_FOUND.code);
        }
        if (!consultation) {
            throw new HTTPError("Consultation not found", HTTP_NOT_FOUND.code);
        }
        if (user.balance < consultation.price) {
            throw new HTTPError("Insufficient balance", HTTP_BAD_REQUEST.code);
        }
        await Promise.all([
            this.userService.update(user.id, {
                balance: {
                    decrement: consultation.price
                }
            }),
            this.userService.update(doctor.id, {
                balance: {
                    increment: consultation.price
                }
            })
        ]);
        const appointmentDate = new Date(data.appointmentDate as string);

        // Parse hours and minutes from "14:30"
        const [hours, minutes] = (data.appointmentTime as string).split(':').map(Number);
        appointmentDate.setUTCHours(hours, minutes, 0, 0);

        const appointment = await prisma.appointments.create({
            data: {
                ...data,
                appointmentDate: appointmentDate.toISOString(),       // "2026-03-15T00:00:00.000Z"
                appointmentTime: appointmentDate.toISOString(),       // "2026-03-15T14:30:00.000Z"
                status: AppointmentStatus.PENDING,
                totalPrice: consultation.price,
            },
            include: {
                doctor: true,
                user: true,
            }
        });

        return appointment;
    }
    async list(userId: string) {
        return await prisma.appointments.findMany({
            where: {
                userId
            },
            include: {
                doctor: true,
                user: true,
            }
        });
    }
    async findById(id: string) {
        return await prisma.appointments.findUnique({
            where: { id },
            include: {
                doctor: true,
                user: true,
            }
        });
    }
    async search(data: Prisma.AppointmentsFindManyArgs) {
        return await prisma.appointments.findMany({
            ...data
        });
    }
    async confirm(id: string) {
        const appointment = await this.findById(id);
        if (!appointment) {
            throw new HTTPError("Appointment not found", HTTP_NOT_FOUND.code);
        }
        if (appointment.status !== AppointmentStatus.PENDING) {
            throw new HTTPError("Only pending appointments can be confirmed", HTTP_BAD_REQUEST.code);
        }
        const existingAppointment = await this.search({
            where: {
                doctorId: appointment.doctorId,
                status: AppointmentStatus.CONFIRMED,
                appointmentTime: appointment.appointmentTime,
                appointmentDate: appointment.appointmentDate,
            }
        });
        if (existingAppointment.length > 0) {
            throw new HTTPError("Appointment already exists at this time", HTTP_BAD_REQUEST.code);
        }
        return await prisma.appointments.update({
            where: { id },
            data: {
                status: AppointmentStatus.CONFIRMED
            }
        });
    }
    async cancel(id: string) {
        const appointment = await this.findById(id);
        if (!appointment) {
            throw new HTTPError("Appointment not found", HTTP_NOT_FOUND.code);
        }
        if (appointment.status !== AppointmentStatus.CONFIRMED && appointment.status === AppointmentStatus.CANCELLED) {
            throw new HTTPError("Only pending or confirmed appointments can be cancelled", HTTP_BAD_REQUEST.code);
        }
        await Promise.all([
            this.userService.update(appointment.userId, {
                balance: {
                    increment: appointment.totalPrice || 0
                }
            }),
            this.userService.update(appointment.doctorId, {
                balance: {
                    decrement: appointment.totalPrice || 0
                }
            })
        ]);
        return await prisma.appointments.update({
            where: { id },
            data: {
                status: AppointmentStatus.CANCELLED
            }
        });
    }
    async complete(id: string) {
        const appointment = await this.findById(id);
        if (!appointment) {
            throw new HTTPError("Appointment not found", HTTP_NOT_FOUND.code);
        }
        if (appointment.status !== AppointmentStatus.CONFIRMED) {
            throw new HTTPError("Only confirmed appointments can be completed", HTTP_BAD_REQUEST.code);
        }
        return await prisma.appointments.update({
            where: { id },
            data: {
                status: AppointmentStatus.COMPLETED,
            }
        });
    }
}