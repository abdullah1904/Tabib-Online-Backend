import { tool } from "langchain";
import z from "zod";
import prisma from "../../../lib/prisma.js";
import { getConsultationDurationText, getConsultationTypeText, getDayOfWeekText, getUpcomingDateNumbers } from "../../../utils/index.js";

export const doctorConsultationsTool = tool(
    async ({ doctorId }: { doctorId: string }) => {
        const consultations = await prisma.consultations.findMany({
            where: { doctorId },
            orderBy: { createdAt: "desc" },
            include: {
                consultationSlots: true,
            }
        });
        if (consultations.length === 0) {
            return `No consultations found for doctor with ID: ${doctorId}`;
        }
        const parsedConsultations = consultations.map(consultation => {
            return {
                id: consultation.id,
                type: getConsultationTypeText(consultation.type),
                price: `${consultation.price} PKR`,
                duration: getConsultationDurationText(consultation.duration),
                time: consultation.time,
                availableDays: getUpcomingDateNumbers(consultation.consultationSlots.map(slot => slot.dayOfWeek),1),
            }
        });
        
        return JSON.stringify(parsedConsultations);
    },
    {
        name: "DoctorConsultations",
        description: "Use this tool to search for doctor-specific medical information and history.",
        schema: z.object({
            doctorId: z.string().describe("The unique identifier of the doctor whose medical information is being requested.")
        })
    }
);