import { Prisma } from "../../generated/prisma/client";
import prisma from "../../lib/prisma";
import { HTTPError } from "../../types";
import { HttpStatusCode, UserRole } from "../../utils/constants";
import { matchDoctor } from "./workflows/matching.workflow";
import { reviewRatings } from "./workflows/reviewRatings.workflow";

const {
    HTTP_NOT_FOUND
} = HttpStatusCode;

export class DoctorsServices {
    async recommendDoctors(id: string) {
        const medicalRecord = await prisma.medicalRecords.findUnique({
            where: { userId: id },
        });

        if (!medicalRecord) {
            const doctors = await prisma.users.findMany({
                where: {
                    role: UserRole.DOCTOR,
                    professionalInfo: { isActive: true },
                },
                include: {
                    professionalInfo: true,
                    doctorReviews: { select: { rating: true } },
                },
            });

            const doctorsWithRating = doctors.map(({ doctorReviews, ...rest }) => ({
                ...rest,
                averageRating: doctorReviews.length
                    ? doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length
                    : null,
            }));

            return {
                doctors: doctorsWithRating,
                recommendationReasoning:
                    "No medical record found for the user. Returning all doctors as recommendations. Please update your medical record to get personalized doctor recommendations in the future.",
            };
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
                    // isActive: true,
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

        const doctorsWithRating = allDoctors.map(({ doctorReviews, ...rest }) => ({
            ...rest,
            averageRating: doctorReviews.length
                ? doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length
                : 0,
        }));

        const doctors = doctorsWithRating.sort((a, b) => {
            const aSpec = a.professionalInfo?.specialization;
            const bSpec = b.professionalInfo?.specialization;

            if (aSpec === primary && bSpec !== primary) return -1;
            if (aSpec !== primary && bSpec === primary) return 1;
            if (aSpec === secondary && bSpec !== secondary) return -1;
            if (aSpec !== secondary && bSpec === secondary) return 1;
            return 0;
        });

        return {
            doctors,
            recommendationReasoning: reasoning,
        };
    }
    async findById(id: string) {
        const doctor = await prisma.users.findUnique({
            where: { id, role: UserRole.DOCTOR },
            include: { 
                professionalInfo: true, 
                doctorReviews: {
                    select: {
                        createdAt: true,
                        rating: true,
                        comment: true,
                        user: true,
                    }
                }, 
                consultations: {
                include: {
                    consultationSlots: true,
                }
            } },
        });
        if (!doctor) {
            throw new HTTPError("Doctor not found", HTTP_NOT_FOUND.code);
        }
        const averageRating = doctor.doctorReviews.length
            ? doctor.doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctor.doctorReviews.length
            : 0;
        return {
            ...doctor,
            averageRating,
        };
    }
    async createReview(data: {comment: string, doctorId: string, userId: string}) {
        const doctor = await prisma.users.findUnique({
            where: { id: data.doctorId, role: UserRole.DOCTOR },
        });
        if (!doctor) {
            throw new HTTPError("Doctor not found", HTTP_NOT_FOUND.code);
        }
        const ratings = await reviewRatings(data.comment);
        const review = await prisma.reviews.create({
            data: {
                ...data,
                rating: ratings
            }
        });
        return review;
    }
    async getReviewsByDoctorId(doctorId: string) {
        console.log(doctorId);
        const doctor = await prisma.users.findUnique({
            where: { id: doctorId, role: UserRole.DOCTOR },
        });
        if (!doctor) {
            throw new HTTPError("Doctor not found", HTTP_NOT_FOUND.code);
        }
        const reviews = await prisma.reviews.findMany({
            where: { doctorId },
            include: { user: { select: { fullName: true, email: true, imageURL: true } } },
        });
        return reviews;
    }
}