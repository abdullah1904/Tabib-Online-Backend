import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service";
import { medicalProfileSchema, pmdcInfoSchema, professionalInfoSchema, profileSchema } from "../../validators/users.validator";
import { HttpStatusCode } from "../../utils/constants";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

export class UsersControllers {
    private usersService: UsersService;
    constructor() {
        this.usersService = new UsersService();
    }
    
    updateUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value} = profileSchema.validate(req.body);
            if(error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const updatedUser = await this.usersService.updateUserProfile(req.user.id, value);
            res.status(HTTP_OK.code).json({
                message: "User profile updated successfully",
                user: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    getMedicalRecordController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const medicalRecord = await this.usersService.getMedicalRecord(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "Medical record retrieved successfully",
                medicalRecord,
            });
        }
        catch (error) {
            next(error);
        }
    }
    updateMedicalRecordController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value} = medicalProfileSchema.validate(req.body);
            if(error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const updatedMedicalRecord = await this.usersService.updateMedicalRecord(req.user.id, value);
            res.status(HTTP_OK.code).json({
                message: "Medical record updated successfully",
                medicalRecord: updatedMedicalRecord,
            });
        }
        catch (error) {
            next(error);
        }
    }
    getProfessionalInfoController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const professionalInfo = await this.usersService.getProfessionalInfo(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "Professional info retrieved successfully",
                professionalInfo,
            });
        }
        catch (error) {
            next(error);
        }
    }
    updateProfessionalInfoController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value} = professionalInfoSchema.validate(req.body);
            if(error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const updatedProfessionalInfo = await this.usersService.updateProfessionalInfo(req.user.id, value);
            res.status(HTTP_OK.code).json({
                message: "Professional info updated successfully",
                professionalInfo: updatedProfessionalInfo,
            });
        }
        catch (error) {
            
        }
    }
    updatePmdcInfoController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = pmdcInfoSchema.validate(req.body);
            if(error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const updatedProfessionalInfo = await this.usersService.updateProfessionalInfo(req.user.id, value);
            res.status(HTTP_OK.code).json({
                message: "PMDC info updated successfully",
                professionalInfo: updatedProfessionalInfo,
            });
        }
        catch (error) {
            next(error);
        }
    }
}