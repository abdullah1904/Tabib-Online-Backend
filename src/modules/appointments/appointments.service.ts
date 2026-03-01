import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";

export class AppointmentsService {
    async create(data: Prisma.AppointmentsCreateInput){
        return await prisma.appointments.create({
            data
        });
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
    async update(id: string, data: Prisma.AppointmentsUpdateInput) {
        return await prisma.appointments.update({
            where: { id },
            data
        });
    }
    async delete(id: string) {
        return await prisma.appointments.delete({
            where: { id }
        });
    }
}