import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service";
import { profileSchema } from "../../validators/users.validator";
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

    listAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.usersService.findAll();
            res.status(HTTP_OK.code).json({
                message: "Users retrieved successfully",
                users,
            });
        }
        catch (error) {
            next(error);
        }
    }

    // listAllUserDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const doctors = await this.usersService.findAllDoctors();
    //         res.status(HTTP_OK.code).json({
    //             message: "Doctors retrieved successfully",
    //             doctors,
    //         });
    //     }
    // }

    getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await this.usersService.findById(id);
            if(!user) {
                res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
                return;
            }
            res.status(HTTP_OK.code).json({
                message: "User retrieved successfully",
                user,
            });
        }
        catch (error) {
            next(error);
        }
    }

    getUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.usersService.getUserProfile(req.user.id);
            res.status(HTTP_OK.code).json({
                message: "User profile retrieved successfully",
                user,
            });
        }
        catch (error) {
            next(error);
        }
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
            const { error, value} = profileSchema.validate(req.body);
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
}