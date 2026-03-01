import { NextFunction, Request, Response } from "express";
import { pmdcVerificationValidator } from "../../validators/pmdc-verification.validator";
import { HttpStatusCode } from "../../utils/constants";
import { PMDCVerificationService } from "./pmdc-verification.service";

const {
    HTTP_BAD_REQUEST
} = HttpStatusCode;

export class PMDCVerificationController {
    private pmdcVerificationService: PMDCVerificationService;
    constructor() {
        this.pmdcVerificationService = new PMDCVerificationService();
    }
    createVerificationApplication = async (req: Request, res: Response, next:NextFunction) => {
        try{
            const {error,value} = pmdcVerificationValidator.validate(req.body);
            if (error) {
                res.status(HttpStatusCode.HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const application = await this.pmdcVerificationService.createVerificationApplication({
                PMDCLicenseDocumentURL: value.pmdcLicenseDocumentURL,
                PMDCRedgDate: value.pmdcRedgDate,
                PMDCRedgNo: value.pmdcRedgNo,
                doctor: { connect: { id: req.params.doctorId.toString() } },
            });
            res.status(HttpStatusCode.HTTP_OK.code).json({
                message: "Verification application created successfully",
                application
            });
        }
        catch(error){
            next(error);
        }
    }
    listVerificationApplications = async (req: Request, res: Response, next:NextFunction) => {
        try{
            const applications = await this.pmdcVerificationService.listVerificationApplications(req.params.doctorId.toString());
            res.status(HttpStatusCode.HTTP_OK.code).json({
                message: "Verification applications retrieved successfully",
                applications
            });
        }
        catch(error){
            next(error);
        }
    }
}