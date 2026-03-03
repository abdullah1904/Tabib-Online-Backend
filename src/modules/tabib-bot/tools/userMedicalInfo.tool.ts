import { tool } from "langchain";
import prisma from "../../../lib/prisma.js";
import { RunnableConfig } from "@langchain/core/runnables";

export const userMedicalInfoTool = tool(
    async (_input, config: RunnableConfig) => {
        const userId = config.configurable?.userId;
        const medicalInfo = await prisma.medicalRecords.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        if (!medicalInfo) {
            return `No medical information found for user with ID: ${userId}`;
        }
        return `Medical Information for User ID ${userId}:\n
        - Current Medications: ${medicalInfo.currentMedications}\n
        - Past Medical History: ${medicalInfo.pastMedicalHistory}\n
        - Allergies: ${medicalInfo.allergies}\n
        - Family Medical History: ${medicalInfo.familyMedicalHistory}\n
        - Last Updated: ${medicalInfo.updatedAt}`;
    },
    {
        name: "UserMedicalInfo",
        description: "Use this tool to search for user-specific medical information and history.",
    }
);