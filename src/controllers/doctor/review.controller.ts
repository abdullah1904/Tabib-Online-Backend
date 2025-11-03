import { NextFunction, Request, Response } from "express";
import { DoctorReviewTable, DoctorReviewTableRelations } from "../../models/doctorReview.model";
import { db } from "../..";
import { eq } from "drizzle-orm";
import { HttpStatusCode } from "../../utils/constants";
import { UserTable } from "../../models/user.model";

const {
    HTTP_OK,
} = HttpStatusCode;

const ListReviewsDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const reviews = await db
            .select({
                id: DoctorReviewTable.id,
                ratings: DoctorReviewTable.ratings,
                comment: DoctorReviewTable.comment,
                createdAt: DoctorReviewTable.createdAt,
                updatedAt: DoctorReviewTable.updatedAt,
                doctor: DoctorReviewTable.doctor,
                user: {
                    id: UserTable.id,
                    fullName: UserTable.fullName,
                    email: UserTable.email,
                    phoneNumber: UserTable.phoneNumber,
                    imageURL: UserTable.imageURL
                }
            })
            .from(DoctorReviewTable)
            .leftJoin(UserTable, eq(DoctorReviewTable.user, UserTable.id))
            .where(eq(DoctorReviewTable.doctor, doctorId));
        res.status(HTTP_OK.code).json({
            message: "Reviews fetched successfully",
            reviews
        });
    }
    catch (error) {
        next(error);
    }
}

export {
    ListReviewsDoctor
}