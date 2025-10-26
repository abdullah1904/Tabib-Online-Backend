import { and, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { DoctorTable } from "../../models/doctor.model";
import { db } from "../..";
import { HttpStatusCode } from "../../utils/constants";
import { recommendDoctorMatches } from "../../services/ai-servies/matching.service";
import { DoctorReviewTable } from "../../models/doctorReview.model";
import { CommentValidator } from "../../validators";
import { reviewRatings } from "../../services/ai-servies/review.service";
import { UserTable } from "../../models/user.model";
import { DoctorServiceTable } from "../../models/doctorService.model";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const ListDoctorsUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId, allergies, pastMedicalHistory, currentMedications, familyMedicalHistory } = req.user;
        const { query } = req.query;
        const { password, ...rest } = getTableColumns(DoctorTable);
        const matches = await recommendDoctorMatches({
            pastMedicalHistory,
            allergies,
            currentMedications,
            familyMedicalHistory
        });
        let doctors;
        if (query) {
            doctors = await db
                .select({
                    ...rest,
                    ratings: sql<number>`COALESCE(AVG(${DoctorReviewTable.ratings}), 0)`,
                })
                .from(DoctorTable)
                .leftJoin(DoctorReviewTable, eq(DoctorTable.id, DoctorReviewTable.doctor))
                .where(
                    or(
                        ilike(DoctorTable.fullName, `%${query}%`),
                        ilike(DoctorTable.email, `%${query}%`),
                        ilike(DoctorTable.phoneNumber, `%${query}%`)
                    )
                )
                .groupBy(DoctorTable.id)
                .orderBy(
                    sql`CASE 
            WHEN ${DoctorTable.specialization} = ${matches.primary} THEN 1
            WHEN ${DoctorTable.specialization} = ${matches.secondary} THEN 2
            ELSE 3
          END`,
                    DoctorTable.id
                );
        } else {
            doctors = await db
                .select({
                    ...rest,
                    ratings: sql<number>`COALESCE(AVG(${DoctorReviewTable.ratings})::float, 0)`
                })
                .from(DoctorTable)
                .leftJoin(DoctorReviewTable, eq(DoctorTable.id, DoctorReviewTable.doctor))
                .groupBy(DoctorTable.id)
                .orderBy(DoctorTable.id);
        }
        res.status(HTTP_OK.code).json({
            message: "Doctors retrieved successfully",
            doctors
        });
    }
    catch (error) {
        next(error);
    }
}

const GetDoctorUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.params;
        const { password, ...rest } = getTableColumns(DoctorTable);
        const doctor = await db
            .select({
                ...rest,
                ratings: sql<number>`COALESCE(AVG(${DoctorReviewTable.ratings})::float, 0)`,
                reviewsCount: sql<number>`COUNT(${DoctorReviewTable.id})`,
            })
            .from(DoctorTable)
            .leftJoin(DoctorReviewTable, eq(DoctorTable.id, DoctorReviewTable.doctor))
            .where(eq(DoctorTable.id, Number(doctorId)))
            .groupBy(DoctorTable.id);

        if (doctor.length === 0) {
            return res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
        }
        const [reviews, services] = await Promise.all([
            db.select({
                id: DoctorReviewTable.id,
                ratings: DoctorReviewTable.ratings,
                comment: DoctorReviewTable.comment,
                createdAt: DoctorReviewTable.createdAt,
                userFullName: UserTable.fullName,
            })
                .from(DoctorReviewTable)
                .leftJoin(UserTable, eq(DoctorReviewTable.user, UserTable.id))
                .where(eq(DoctorReviewTable.doctor, Number(doctorId))),
            db.select()
                .from(DoctorServiceTable)
                .where(eq(DoctorServiceTable.doctor, Number(doctorId)))
        ]);
        res.status(HTTP_OK.code).json({
            message: "Doctor retrieved successfully",
            doctor: {
                ...doctor[0],
                reviews,
                services
            }
        });
    }
    catch (error) {
        next(error);
    }
}

const ReviewDoctorUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const { id: doctorId } = req.params;
        const { error, value } = CommentValidator.validate(req.body);
        if (error) {
            return res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
        }

        const [alreadyReviewed, doctor] = await Promise.all([
            db.select().from(DoctorReviewTable).where(
                and(
                    eq(DoctorReviewTable.user, userId),
                    eq(DoctorReviewTable.doctor, Number(doctorId))
                )
            ),
            db.select().from(DoctorTable).where(eq(DoctorTable.id, Number(doctorId)))
        ]);

        if (doctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
            return;
        }
        if (alreadyReviewed.length > 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "You have already reviewed this doctor" });
            return;
        }

        const ratings = await reviewRatings(value.comment);
        const review = await db.insert(DoctorReviewTable).values({
            user: userId,
            doctor: Number(doctorId),
            comment: value.comment,
            ratings: ratings
        }).returning();
        res.status(HTTP_CREATED.code).json({
            message: "Review submitted successfully",
            review: review[0]
        });
    }
    catch (error) {
        console.error("Error occurred while reviewing doctor:", error);
        next(error);
    }
}

export {
    ListDoctorsUser,
    GetDoctorUser,
    ReviewDoctorUser
}