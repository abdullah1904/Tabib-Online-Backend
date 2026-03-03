import { tool } from "langchain";
import prisma from "../../../lib/prisma.js";
import { RunnableConfig } from "@langchain/core/runnables";
import { UserRole } from "../../../utils/constants.js";
import { matchDoctor } from "../../doctors/workflows/matching.workflow.js";
import { getSpecializationText } from "../../../utils/index.js";

export const recommendDoctorTool = tool(
    async (_input, config: RunnableConfig) => {
        const userId = config.configurable?.userId;
        const medicalRecord = await prisma.medicalRecords.findUnique({
            where: { userId },
        });

        if (!medicalRecord) {
            return `No medical record found for the user. Please update your medical record to get personalized doctor recommendations.`;
        }

        const { allergies, familyMedicalHistory, currentMedications, pastMedicalHistory } = medicalRecord;
        const { primary, secondary, reasoning } = await matchDoctor({
            pastMedicalHistory,
            allergies,
            currentMedications,
            familyMedicalHistory,
        });

        const allDoctors = await prisma.users.findMany({
            where: {
                role: UserRole.DOCTOR,
                professionalInfo: {
                    isActive: true,
                },
            },
            select: {
                id: true,
                imageURL: true,
                fullName: true,
                gender: true,
                professionalInfo: {
                    select: {
                        PMDCVerifiedAt: true,
                        specialization: true,
                        yearsOfExperience: true,
                        prefix: true,
                    },
                },
                doctorReviews: {
                    select: { rating: true },
                },
            },
        });
        if(allDoctors.length === 0) {
            return `No doctors found matching the recommended specializations. Please consider updating your medical record for better recommendations.`;
        }
        const doctors = allDoctors.sort((a: any, b: any) => {
            const aSpec = a.professionalInfo?.specialization;
            const bSpec = b.professionalInfo?.specialization;

            if (aSpec === primary && bSpec !== primary) return -1;
            if (aSpec !== primary && bSpec === primary) return 1;
            if (aSpec === secondary && bSpec !== secondary) return -1;
            if (aSpec !== secondary && bSpec === secondary) return 1;
            return 0;
        });
        
        const doctorWithRatings = doctors.map(doctor => {
            const ratings = doctor.doctorReviews.map(review => review.rating);
            const averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length || 0;
            return {
                ...doctor,
                averageRating,
                professionalInfo: {
                    ...doctor.professionalInfo,
                    specialization: getSpecializationText(doctor.professionalInfo?.specialization!)
                }
            }
        });
        return {
            doctors: doctorWithRatings,
            recommendationReasoning: reasoning,
        };
     },
    {
        name: "RecommendDoctor",
        description: "Use this tool to recommend a suitable doctor or specialist based on the user's medical history and current conditions.",
    }
);