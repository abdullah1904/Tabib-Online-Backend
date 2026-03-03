import { tool } from "langchain";
import z from "zod";
import prisma from "../../../lib/prisma.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { AppointmentStatus, UserRole } from "../../../utils/constants.js";
import { getDayOfWeekText } from "../../../utils/index.js";

const createUtcDate = (year: number, month: number, day: number) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    const isValid =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;

    if (!isValid) {
        throw new Error("Invalid appointment date");
    }

    return date;
};

const normalizeDateInput = (input: string) => {
    const raw = input.trim();
    if (!raw) {
        throw new Error("Appointment date is required");
    }

    const lower = raw.toLowerCase();
    const today = new Date();

    if (lower === "today") {
        return {
            normalized: `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`,
            date: createUtcDate(today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate()),
        };
    }

    if (lower === "tomorrow") {
        const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
        return {
            normalized: `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth() + 1).padStart(2, "0")}-${String(tomorrow.getUTCDate()).padStart(2, "0")}`,
            date: createUtcDate(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate()),
        };
    }

    const yyyyMmDd = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (yyyyMmDd) {
        const year = Number(yyyyMmDd[1]);
        const month = Number(yyyyMmDd[2]);
        const day = Number(yyyyMmDd[3]);
        const date = createUtcDate(year, month, day);
        return {
            normalized: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            date,
        };
    }

    const ddMmYyyyOrMmDdYyyy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (ddMmYyyyOrMmDdYyyy) {
        const first = Number(ddMmYyyyOrMmDdYyyy[1]);
        const second = Number(ddMmYyyyOrMmDdYyyy[2]);
        const year = Number(ddMmYyyyOrMmDdYyyy[3]);

        const day = second > 12 && first <= 12 ? second : first;
        const month = second > 12 && first <= 12 ? first : second;

        const date = createUtcDate(year, month, day);
        return {
            normalized: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            date,
        };
    }

    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = parsed.getMonth() + 1;
        const day = parsed.getDate();
        const date = createUtcDate(year, month, day);

        return {
            normalized: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            date,
        };
    }

    throw new Error("Invalid appointment date format");
};

const normalizeTimeInput = (input: string) => {
    const raw = input.trim().toLowerCase();
    if (!raw) {
        throw new Error("Appointment time is required");
    }

    const normalizedRaw = raw.replace(/\./g, "");

    const hhMmSs = normalizedRaw.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    if (hhMmSs) {
        const hours = Number(hhMmSs[1]);
        const minutes = Number(hhMmSs[2]);
        return {
            normalized: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
            hours,
            minutes,
        };
    }

    const amPm = normalizedRaw.match(/^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)$/);
    if (amPm) {
        const baseHour = Number(amPm[1]);
        const minutes = Number(amPm[2] ?? "0");
        const meridiem = amPm[3];

        if (baseHour < 1 || baseHour > 12) {
            throw new Error("Invalid appointment time");
        }

        const hours = (baseHour % 12) + (meridiem === "pm" ? 12 : 0);
        return {
            normalized: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
            hours,
            minutes,
        };
    }

    throw new Error("Invalid appointment time format");
};

const appointmentSchema = z.object({
    doctorId: z.string().describe("The unique identifier of the doctor for whom the appointment is being booked."),
    consultationId: z.string().describe("The unique identifier of the consultation for which the appointment is being booked."),
    appointmentDate: z
        .string()
        .min(1, "Appointment date is required")
        .describe("The date for which the appointment is being booked. Supports flexible formats like YYYY-MM-DD, DD/MM/YYYY, March 10 2026, today, tomorrow."),

    appointmentTime: z
        .string()
        .min(1, "Appointment time is required")
        .describe("The time for which the appointment is being booked. Supports HH:MM, HH:MM:SS, 2pm, 2:30 pm."),

    additionalNotes: z
        .string()
        .max(500, "Additional notes must be less than or equal to 500 characters long")
        .optional()
        .or(z.literal(''))
        .describe("Any additional notes or information the patient wants to provide for the appointment. This field is optional."),

    healthInfoSharingConsent: z
        .boolean()
        .optional()
        .describe("Indicates whether the patient consents to share their health information with the doctor for the purpose of the appointment. This field is optional.")
})

// type of zod schema 
type AppointmentInput = z.infer<typeof appointmentSchema>;


export const bookAppointmentTool = tool(
    async (data: AppointmentInput, context: RunnableConfig) => {
        const userId = context.configurable?.userId;

        const parsedDate = normalizeDateInput(data.appointmentDate);
        const parsedTime = normalizeTimeInput(data.appointmentTime);

        const appointmentDate = new Date(`${parsedDate.normalized}T00:00:00.000Z`);
        if (isNaN(appointmentDate.getTime())) {
            throw new Error("Invalid appointment date");
        }

        const todayUtc = new Date();
        todayUtc.setUTCHours(0, 0, 0, 0);
        if (appointmentDate < todayUtc) {
            throw new Error("Appointment date must be today or a future date");
        }

        const { hours, minutes } = parsedTime;
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            throw new Error("Invalid appointment time");
        }

        appointmentDate.setUTCHours(hours, minutes, 0, 0);

        const [doctor, user, consultation] = await Promise.all([
            prisma.users.findFirst({ where: { id: data.doctorId, role: UserRole.DOCTOR } }),
            prisma.users.findFirst({ where: { id: userId } }),
            prisma.consultations.findFirst({
                where: { id: data.consultationId },
                include: { consultationSlots: true },
            }),
        ]);
        if (!doctor) {
            throw new Error("Doctor not found");
        }
        if (!user) {
            throw new Error("User not found");
        }
        if (!consultation) {
            throw new Error("Consultation not found");
        }

        if (consultation.doctorId !== doctor.id) {
            throw new Error("The selected consultation does not belong to the selected doctor");
        }

        const requestedDayOfWeek = parsedDate.date.getUTCDay();
        const availableDays = consultation.consultationSlots.map((slot) => slot.dayOfWeek);

        if (!availableDays.includes(requestedDayOfWeek)) {
            const readableDays = [...new Set(availableDays)]
                .sort((a, b) => a - b)
                .map((day) => getDayOfWeekText(day))
                .filter(Boolean)
                .join(", ");

            throw new Error(
                `This consultation is not available on the selected date. Available days: ${readableDays || "Not configured"}`,
            );
        }

        if (!consultation.allowCustom) {
            const consultationHours = consultation.time.getUTCHours();
            const consultationMinutes = consultation.time.getUTCMinutes();

            if (hours !== consultationHours || minutes !== consultationMinutes) {
                const consultationTime = `${consultationHours.toString().padStart(2, '0')}:${consultationMinutes.toString().padStart(2, '0')}`;
                throw new Error(`This consultation can only be booked at ${consultationTime}`);
            }
        }

        const existingAppointment = await prisma.appointments.findFirst({
            where: {
                doctorId: doctor.id,
                appointmentTime: appointmentDate.toISOString(),
                status: {
                    in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
                },
            },
        });

        if (existingAppointment) {
            throw new Error("This slot is already booked. Please choose another date or time.");
        }

        if (user.balance < consultation.price) {
            throw new Error("Insufficient balance");
        }
        await Promise.all([
            prisma.users.update({
                where: { id: user.id },
                data: {
                    balance: {
                        decrement: consultation.price
                    }
                }
            }),
            prisma.users.update({
                where: { id: doctor.id },
                data: {
                    balance: {
                        increment: consultation.price
                    }
                }
            })
        ]);
        const appointment = await prisma.appointments.create({
            data: {
                ...data,
                userId: userId,
                appointmentDate: appointmentDate.toISOString(),       // "2026-03-15T00:00:00.000Z"
                appointmentTime: appointmentDate.toISOString(),       // "2026-03-15T14:30:00.000Z"
                status: AppointmentStatus.PENDING,
                totalPrice: consultation.price,
            },
        });

        return appointment;
    },
    {
        name: "BookAppointment",
        description: "Use this tool to book an appointment with a doctor.",
        schema: appointmentSchema
    }
);