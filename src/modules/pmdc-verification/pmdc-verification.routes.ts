import { Router } from "express";
import { PMDCVerificationController } from "./pmdc-verification.controller.js";
import { uploadImageMiddleware } from "../../middlewares/upload.middleware.js";

const pmdcVerificationRouter = Router();
const pmdcVerificationController = new PMDCVerificationController();

pmdcVerificationRouter.post("/:doctorId", uploadImageMiddleware('PMDC_VERIFICATION'),pmdcVerificationController.createVerificationApplication);
pmdcVerificationRouter.get("/:doctorId", pmdcVerificationController.listVerificationApplications);

export default pmdcVerificationRouter;