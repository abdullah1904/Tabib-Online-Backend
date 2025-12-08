import { Request, Response, NextFunction } from "express";
import { db } from "../..";
import { DoctorAppointmentTable } from "../../models/doctorAppointment.model";
import { UserTable } from "../../models/user.model";
import { AppointmentStatus, HttpStatusCode } from "../../utils/constants";
import { and, eq } from "drizzle-orm";
import { sendEmail } from "../../utils";

const {
    HTTP_OK,
    HTTP_NOT_FOUND,
} = HttpStatusCode;

const ListAppointmentsDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const appointments = await db
            .select({
                id: DoctorAppointmentTable.id,
                appointmentDate: DoctorAppointmentTable.appointmentDate,
                appointmentTime: DoctorAppointmentTable.appointmentTime,
                status: DoctorAppointmentTable.status,
                createdAt: DoctorAppointmentTable.createdAt,
                updatedAt: DoctorAppointmentTable.updatedAt,
                user: {
                    id: UserTable.id,
                    fullName: UserTable.fullName,
                    email: UserTable.email,
                    phoneNumber: UserTable.phoneNumber,
                    imageURL: UserTable.imageURL
                }
            })
            .from(DoctorAppointmentTable)
            .leftJoin(UserTable, eq(DoctorAppointmentTable.user, UserTable.id))
            .where(eq(DoctorAppointmentTable.doctor, doctorId));
        res.status(HTTP_OK.code).json({
            message: "Appointments fetched successfully",
            appointments
        });
    }
    catch (error) {
        next(error);
    }
}

const ApproveAppointmentDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: appointmentId } = req.params;
        const { id: doctorId, fullName: doctorName } = req.doctor;

        const appointment = await db.select({
            appointment: DoctorAppointmentTable,
            user: UserTable
        })
            .from(DoctorAppointmentTable)
            .leftJoin(
                UserTable,
                eq(UserTable.id, DoctorAppointmentTable.user)
            )
            .where(
                and(
                    eq(DoctorAppointmentTable.id, Number(appointmentId)),
                    eq(DoctorAppointmentTable.doctor, doctorId),
                    eq(DoctorAppointmentTable.status, AppointmentStatus.PENDING)
                )
            );


        if (appointment.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({
                error: "Appointment not found or already processed."
            });
            return;
        }

        const updatedAppointment = await db
            .update(DoctorAppointmentTable)
            .set({
                status: AppointmentStatus.CONFIRMED,
                updatedAt: new Date(),
            })
            .where(eq(DoctorAppointmentTable.id, Number(appointmentId)))
            .returning();

        if (appointment[0].user && appointment[0].user.email) {
            await sendEmail(
                appointment[0].user.email,
                "Appointment Approved",
                `Dear ${appointment[0].user.fullName},
                Your appointment scheduled on ${appointment[0].appointment.appointmentDate} at ${appointment[0].appointment.appointmentTime} has been approved by the ${doctorName}.
                `
            )
        }
        res.status(HTTP_OK.code).json({
            message: "Appointment approved successfully.",
            appointment: updatedAppointment[0],
        });

    } catch (error) {
        next(error);
    }
};


export {
    ListAppointmentsDoctor,
    ApproveAppointmentDoctor
}