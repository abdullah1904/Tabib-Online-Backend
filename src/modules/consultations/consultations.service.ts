import { includes } from "zod/v4";
import prisma from "../../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { HTTPError } from "../../types";
import { HttpStatusCode } from "../../utils/constants";

const {
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

export class ConsultationsService {
    async list(doctorId: string) {
        return await prisma.consultations.findMany({
            where: { doctorId },
            include: { consultationSlots: true }
        });
    }
    async create(data: Prisma.ConsultationsCreateInput) {
        const alreadyExists = await prisma.consultations.findFirst({
            where: {
                doctor: { is: { id: (data.doctor as any).connect?.id } },
                type: data.type,
                duration: data.duration,
                time: data.time
            }
        });
        if (alreadyExists) {
            throw new HTTPError("Consultation with the same type, duration and time already exists for this doctor", HTTP_BAD_REQUEST.code);
        }
        return await prisma.consultations.create({
            data
        });
    }
    async findById(id: string) {
        return await prisma.consultations.findUnique({
            where: { id },
            include: { consultationSlots: true }
        });
    }
    async update(id: string, data: Prisma.ConsultationsUpdateInput) {
        return await prisma.consultations.update({
            where: { id },
            data
        });
    }
    async remove(id: string) {
        const appointment = await prisma.appointments.findFirst({
            where: { consultationId: id }
        });
        if(appointment) {
            throw new HTTPError("Cannot delete consultation with existing appointments", HTTP_BAD_REQUEST.code);
        }
        return await prisma.consultations.delete({
            where: { id }
        });
    }
}