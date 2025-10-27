import { Request, Response, NextFunction } from "express";
import { doctorServiceValidator } from "../../validators/doctor.validators";
import { HttpStatusCode } from "../../utils/constants";
import { db } from "../..";
import { and, eq, inArray } from "drizzle-orm";
import { DoctorServiceAvailabilityTable, DoctorServiceTable } from "../../models/doctorService.model";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const CreateServiceDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const { error, value } = doctorServiceValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const alreadyService = await db.select()
            .from(DoctorServiceTable)
            .where(and(
                eq(DoctorServiceTable.doctor, doctorId),
                eq(DoctorServiceTable.type, value.type),
                eq(DoctorServiceTable.duration, value.duration),
                eq(DoctorServiceTable.time, value.time)
            ));
        if (alreadyService.length > 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "A similar service already exists." });
            return;
        }
        const newService = await db.insert(DoctorServiceTable).values({
            title: value.title,
            description: value.description,
            type: value.type,
            price: value.price,
            duration: value.duration,
            time: value.time,
            location: value.location,
            doctor: doctorId
        }).returning();

        const daysToInsert = value.availableDays.map((dayOfWeek: number) => ({
            service: newService[0].id,
            dayOfWeek: dayOfWeek
        }));

        await db.insert(DoctorServiceAvailabilityTable).values(daysToInsert);

        res.status(HTTP_CREATED.code).json({ message: "Service created successfully", service: {
            ...newService[0],
            availableDays: value.availableDays
        } });
    }
    catch (error) {
        next(error);
    }
}

const ListServicesDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        
        const services = await db.select()
            .from(DoctorServiceTable)
            .where(eq(DoctorServiceTable.doctor, doctorId));

        const serviceIds = services.map(s => s.id);
        
        const days = serviceIds.length > 0 
            ? await db.select()
                .from(DoctorServiceAvailabilityTable)
                .where(inArray(DoctorServiceAvailabilityTable.service, serviceIds))
            : [];

        const servicesWithDays = services.map(service => ({
            ...service,
            availableDays: days
                .filter(day => day.service === service.id)
                .map(day => day.dayOfWeek)
        }));

        res.status(HTTP_OK.code).json({ 
            message: "Services retrieved successfully", 
            services: servicesWithDays 
        });
    }
    catch (error) {
        next(error);
    }
}

const DeleteServiceDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const { id: serviceId } = req.params;
        const deletedService = await db.delete(DoctorServiceTable).where(
            and(
                eq(DoctorServiceTable.doctor, doctorId),
                eq(DoctorServiceTable.id, Number(serviceId))
            )
        ).returning();
        if (deletedService.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Service not found" });
            return;
        }
        res.status(HTTP_OK.code).json({ message: "Service deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}

export {
    CreateServiceDoctor,
    ListServicesDoctor,
    DeleteServiceDoctor
}