import { NextFunction, Request, Response } from "express";
import { updateProfileAdminValidator } from "../../validators/admin.validators";
import { HttpStatusCode } from "../../utils/constants";
import { AdminTable } from "../../models/admin.model";
import { db } from "../..";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "../../utils";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST
} = HttpStatusCode;

const updateProfileAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: adminId, imageURL: adminImageURL } = req.admin;
        const { error, value } = updateProfileAdminValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }

        const updatedProfile = await db.update(AdminTable).set({
            fullName: value.fullName,
            recoveryEmail: value.recoveryEmail,
            imageURL: value.imageURL || null,
        }).where(eq(AdminTable.id, adminId)).returning();

        if (updatedProfile.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Profile update failed" });
            return;
        }

        if (req.body.imageURL && adminImageURL){
            await deleteCloudinaryImage(adminImageURL)
        }

        res.status(HTTP_OK.code).json({ message: "Profile updated successfully", profile: updatedProfile[0] });
    }
    catch (error) {
        next(error);
    }
}

export {
    updateProfileAdmin
}