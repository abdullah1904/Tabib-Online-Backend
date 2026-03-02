import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service.js";
import { checkoutSchema, medicalProfileSchema, payoutSchema, pmdcInfoSchema, professionalInfoSchema, profileSchema } from "../../validators/users.validator.js";
import { HttpStatusCode } from "../../utils/constants.js";
import { stripe } from "../../index.js";
import { config } from "../../utils/config.js";
import Stripe from "stripe";

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
            const { error, value } = profileSchema.validate(req.body);
            if (error) {
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
            const { error, value } = medicalProfileSchema.validate(req.body);
            if (error) {
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
            const { error, value } = professionalInfoSchema.validate(req.body);
            if (error) {
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
            if (error) {
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
    createCheckoutController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = checkoutSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: 'Wallet Top-Up',
                        },
                        unit_amount: value.amount * 100, // Convert to smallest currency unit
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${config.USER_FRONTEND_URL}/profile/wallet?topup=success`,
                cancel_url: `${config.USER_FRONTEND_URL}/profile/wallet?topup=cancel`,
                metadata: {
                    userId: req.user.id,
                    amount: value.amount.toString(),
                },
            });
            res.status(HTTP_OK.code).json({
                message: "Checkout session created successfully",
                url: session.url,
            });
        }
        catch (error) {
            next(error);
        }
    }
    listCheckoutsController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessions = await stripe.checkout.sessions.list();
            const userSessions = sessions.data.filter(
                (session) => session.metadata?.userId === req.user.id.toString()
            ).map((session) => ({
                id: session.id,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency,
                status: session.payment_status,
                checkoutURL: session.url,
                createdAt: new Date(session.created * 1000),
            })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            res.status(HTTP_OK.code).json({
                message: "Wallet top-up sessions retrieved successfully",
                balance: req.user.balance,
                sessions: userSessions
            });
        }
        catch (error) {
            next(error);
        }
    }
}